import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  IswPaymentWebViewProps,
  IswWebViewRefMethods,
  WebCheckoutPayResponse,
} from './types';
import { BackDrop } from './Backdrop';
import {
  SITE_REDIRECT_URL,
  transactionMessages,
  WEB_PAY_HOST_DEV,
  WEB_PAY_HOST_PROD,
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

  const webviewUrl = mode === 'LIVE' ? WEB_PAY_HOST_PROD : WEB_PAY_HOST_DEV;
  const normalizeRedirectValue = (value: string | null) => {
    if (!value || value === 'undefined' || value === 'null') {
      return undefined;
    }

    return value;
  };

  const formData = new URLSearchParams({
    pay_item_id: requestParams.pay_item_id,
    txn_ref: requestParams.txn_ref,
    amount: requestParams.amount.toString(),
    currency: requestParams.currency.toString(),
    merchant_code: requestParams.merchant_code,
    mode: requestParams.mode,
    site_redirect_url: SITE_REDIRECT_URL,
    payment_response_type: 'GET',
  });

  if (requestParams.cust_name) {
    formData.append('cust_name', requestParams.cust_name);
  }
  if (requestParams.cust_email) {
    formData.append('cust_email', requestParams.cust_email);
  }
  if (requestParams.cust_id) {
    formData.append('cust_id', requestParams.cust_id);
  }
  if (requestParams.cust_mobile_no) {
    formData.append('cust_mobile_no', requestParams.cust_mobile_no);
  }
  if (requestParams.tokenise_card) {
    formData.append('tokenise_card', requestParams.tokenise_card);
  }
  if (requestParams.access_token) {
    formData.append('access_token', requestParams.access_token);
  }
  if (payItem.name) {
    formData.append('pay_item_name', payItem.name);
  }
  if (requestParams.split_accounts) {
    formData.append(
      'split_accounts',
      JSON.stringify(requestParams.split_accounts)
    );
  }

  const handleNavigationChange = ({ url }: { url: string }) => {
    if (!url.startsWith(SITE_REDIRECT_URL)) {
      return;
    }

    const redirectUrl = new URL(url);
    console.log({ redirectUrl });

    const resp = normalizeRedirectValue(redirectUrl.searchParams.get('resp'));

    if (!resp) {
      return;
    }

    const responseAmount =
      normalizeRedirectValue(redirectUrl.searchParams.get('amount')) ??
      String(parsedAmount);
    const responseDesc =
      normalizeRedirectValue(redirectUrl.searchParams.get('desc')) ??
      transactionMessages?.[resp];

    completeTransaction({
      payRef: '',
      txnref:
        normalizeRedirectValue(redirectUrl.searchParams.get('txnref')) ??
        trnxRef,
      amount: responseAmount,
      apprAmt: responseAmount,
      resp,
      desc: responseDesc,
      retRef: '',
      cardNum: '',
      mac: '',
    });
  };

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
          uri: webviewUrl,
          method: 'POST',
          body: formData.toString(),
        }}
        style={[style.flex, customStyle]}
        onLoadStart={() => {
          setIsLoading(true);
          setInitializingWebView(false);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigationChange}
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
