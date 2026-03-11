import { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import {
  IswPaymentWebView,
  type IswWebViewRefMethods,
} from 'react-native-interswitch-pay';

export default function App() {
  const webRef = useRef<IswWebViewRefMethods>(null);
  const [txnRef, setTxnRef] = useState(`txn_${Date.now()}`);

  const handleStartPayment = () => {
    try {
      const newTxnRef = `txn_${Date.now()}`;
      setTxnRef(newTxnRef);

      // Added this delay for Test purposes, so you can test multiple times
      setTimeout(() => {
        webRef.current?.start();
      }, 100);
    } catch (error) {
      Alert.alert('Validation Error', (error as Error).message);
    }
  };

  const isw = {
    merchantCode: 'MX6072',
    payItemId: '9405967',
    transactionRef: txnRef,
    amount: 100000,
    currency: '566',
    mode: 'TEST',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Interswitch Payment Gateway</Text>
      <TouchableOpacity style={styles.button} onPress={handleStartPayment}>
        <Text style={styles.buttonText}>Start Payment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.stopButton]}
        onPress={() => webRef.current?.end()}
      >
        <Text style={styles.buttonText}>Stop Payment</Text>
      </TouchableOpacity>
      <IswPaymentWebView
        ref={webRef}
        amount={isw.amount}
        autoStart={false}
        trnxRef={txnRef}
        showBackdrop={false}
        mode={isw.mode as any}
        merchantCode={isw.merchantCode}
        payItem={{ id: isw.payItemId }}
        style={styles.webViewStyle}
        onCompleted={(response) => {
          console.log('AcceptPaymentScreen', response);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  text: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    marginTop: '20%',
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  webViewStyle: {
    marginTop: '10%',
  },
});
