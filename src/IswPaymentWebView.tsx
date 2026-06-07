import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type {
  IswPaymentWebViewProps,
  IswWebViewRefMethods,
  WebCheckoutPayResponse,
} from './types';
import { BackDrop } from './Backdrop';
import {
  INLINE_CHECKOUT_URL_DEV,
  INLINE_CHECKOUT_URL_PROD,
  SITE_REDIRECT_URL,
  transactionMessages,
} from './utils';

const IswPaymentWebView: React.ForwardRefRenderFunction<
  IswWebViewRefMethods,
  IswPaymentWebViewProps
> = (
  {
    trnxRef,
    mode,
    onCompleted,
    payItem,
    accessToken,
    merchantCode,
    tokeniseCard,
    amount,
    currency = 566,
    customer,
    autoStart,
    indicatorColor,
    backButton,
    loadingText,
    splitAccounts,
    style: customStyle,
    showBackdrop = false,
  },
  ref
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [initializingWebView, setInitializingWebView] = useState(false);

  useEffect(() => {
    if (autoStart) {
      setInitializingWebView(true);
      setOpenModal(true);
    }
  }, [autoStart]);

  const cancelProcess = () => {
    setIsLoading(false);
    setOpenModal(false);
    setInitializingWebView(false);
    onCompleted({
      desc: 'Payment modal terminated',
      amount: amount,
      cardNum: '',
      mac: '',
      retRef: '',
      resp: 'Z6',
      txnref: trnxRef,
      payRef: '',
      apprAmt: amount,
    });
  };

  useImperativeHandle(ref, () => ({
    start() {
      setInitializingWebView(true);
      setIsLoading(true);
      setOpenModal(true);
    },
    end() {
      cancelProcess();
    },
  }));

  const completeTransaction = (webCheckoutResponse: WebCheckoutPayResponse) => {
    setOpenModal(false);
    if (onCompleted) {
      onCompleted({
        ...webCheckoutResponse,
        desc:
          webCheckoutResponse.desc ??
          transactionMessages?.[webCheckoutResponse.resp],
      });
    }
  };

  const onMessageHandler = (event: WebViewMessageEvent) => {
    try {
      const postMessageResponse = JSON.parse(event.nativeEvent.data);

      if (postMessageResponse.type === 'PAYMENT_RESPONSE') {
        completeTransaction(postMessageResponse.data as WebCheckoutPayResponse);
        return;
      }

      if (postMessageResponse.type === 'PAYMENT_MODAL_TERMINATED') {
        cancelProcess();
      }
    } catch (_error) {
      // Ignore malformed or unrelated messages from the WebView.
    }
  };

  if (!payItem?.id || !trnxRef || !amount || !merchantCode || !mode) {
    throw new Error(
      'Missing required payment parameters: pay_item_id, txn_ref, amount, merchant_code, mode'
    );
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount)) {
    throw new Error('Amount must be a valid number');
  }

  const requestParams: Record<string, any> = {
    mode,
    currency,
    txn_ref: trnxRef,
    pay_item_id: payItem.id,
    amount: parsedAmount,
    merchant_code: merchantCode,
    site_redirect_url: SITE_REDIRECT_URL,
  };

  if (customer?.name) {
    requestParams.cust_name = customer.name;
  }
  if (customer?.email) {
    requestParams.cust_email = customer.email;
  }
  if (customer?.id) {
    requestParams.cust_id = customer.id;
  }
  if (customer?.phoneNumber) {
    requestParams.cust_mobile_no = customer.phoneNumber;
  }
  if (tokeniseCard) {
    requestParams.tokenise_card = tokeniseCard;
  }
  if (accessToken) {
    requestParams.access_token = accessToken;
  }
  if (splitAccounts) {
    requestParams.split_accounts = splitAccounts;
  }

  const scriptUrl =
    mode === 'LIVE' ? INLINE_CHECKOUT_URL_PROD : INLINE_CHECKOUT_URL_DEV;
  const paymentRequestJson = JSON.stringify({
    ...requestParams,
    site_redirect_url: SITE_REDIRECT_URL,
    pay_item_name: payItem.name,
  }).replace(/</g, '\\u003c');

  const bootstrapHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>Interswitch WebPay</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: transparent;
      }
    </style>
  </head>
  <body>
    <script>
      (function () {
        var paymentRequest = ${paymentRequestJson};
        var scriptUrl = ${JSON.stringify(scriptUrl)};

        function redirectBackToApp() {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_MODAL_TERMINATED',
              data: null
            }));
          }
        }

        window.redirectBackToApp = redirectBackToApp;

        function loadScript(src, callback) {
          var script = document.createElement('script');
          script.src = src;
          script.onload = callback;
          script.onerror = function () {
            redirectBackToApp();
          };
          document.head.appendChild(script);
        }

        function paymentCallback(response) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_RESPONSE',
              data: response
            }));
          }
        }

        loadScript(scriptUrl, function () {
          var checkoutRequest = Object.assign({}, paymentRequest, {
            onComplete: paymentCallback
          });

          if (!checkoutRequest.pay_item_name) {
            delete checkoutRequest.pay_item_name;
          }

          window.webpayCheckout(checkoutRequest);
        });
      })();
    </script>
  </body>
</html>`;

  return (
    <Modal visible={openModal}>
      {initializingWebView && (
        <View style={style.loaderContainer}>
          <Text style={style.loaderText}>
            {loadingText ?? 'Loading Payment Gateway, Please wait.'}
          </Text>
          <ActivityIndicator color={indicatorColor} />
        </View>
      )}
      <WebView
        source={{
          html: bootstrapHtml,
          baseUrl: 'https://localhost',
        }}
        style={[style.flex, customStyle]}
        onMessage={onMessageHandler}
        onLoadStart={() => {
          setIsLoading(true);
          setInitializingWebView(false);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
        }}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
      {showBackdrop && (
        <BackDrop
          color={indicatorColor}
          backButton={backButton}
          isLoading={isLoading}
          onClose={cancelProcess}
        />
      )}
    </Modal>
  );
};

export default forwardRef(IswPaymentWebView) as <T = {}>(
  props: IswPaymentWebViewProps<T> & { ref?: React.Ref<IswWebViewRefMethods> }
) => React.ReactElement;

const style = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: '25%',
  },
  loaderText: {
    marginBottom: 10,
  },
});
