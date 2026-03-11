# react-native-interswitch-pay

<img width="459" alt="Interswitch" src="https://github.com/user-attachments/assets/1450262e-2ae9-4ec3-ac74-31fe50655b49">

The Interswitch React Native SDK simplifies the integration of the Interswitch Payment Gateway (IPG) into your React Native app using a WebView component.

[demo](https://www.loom.com/share/a368f65a0b2641b69e4fce1d74fcbbd8)

## Features

- Flexible implementation following the [official documentation](https://docs.interswitchgroup.com/docs/web-checkout).
- Integrated with the [ Inline Checkout](https://docs.interswitchgroup.com/docs/web-checkout#option-1---inline-checkout).
- Built with TypeScript for type safety and an enhanced developer experience.
- Supports both Expo and React Native CLI.

## Installation

##### Npm

```sh
npm install react-native-interswitch-pay
```

##### Yarn

```sh
yarn  react-native-interswitch-pay
```

##### Expo

```sh
expo  install react-native-interswitch-pay
```

> **_Important_**: This package depends on `react-native-webview` as a peer dependency and requires it for proper functionality.

## Quick Examples.

#### Auto start Payment

```js
import { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import {
  IswPaymentWebView,
  type IswWebViewRefMethods,
} from 'react-native-interswitch-pay';

export default function App() {
  const [txnRef, setTxnRef] = useState(`txn_${Date.now()}`);

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
      <IswPaymentWebView
        amount={isw.amount}
        autoStart={true}
        trnxRef={txnRef}
        showBackdrop={false}
        mode={isw.mode as any}
        merchantCode={isw.merchantCode}
        payItem={{ id: isw.payItemId }}
        style={styles.webViewStyle}
        onCompleted={(response) => {
          console.log('Response', response);
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
  webViewStyle: {
    marginTop: '10%',
  },
});

```

#### Use with custom WebPay Callback Response payload.

```js
import { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import {
  IswPaymentWebView,
  type IswWebViewRefMethods,
} from 'react-native-interswitch-pay';


interface CustomData {
  userId: string;
  orderId: number;
  cardProductionBin: string;
}

export default function App() {
 // rest of the code.

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
      <IswPaymentWebView<CustomData>
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
          console.log('Response', response);
          console.log('Custom Response Data:', response.cardProductionBin);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
 // styles
});

```

#### Use with Ref to trigger using a button

```js
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
          console.log('Response', response);
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

```


### Props

| Props Name           | Description                                           | Required | Value             | Data type |
| -------------------- | ----------------------------------------------------- | -------- | ----------------- | --------- |
| trnxRef | transaction reference.                                | Yes      |                   | string    |
| merchantCode         | ISW merchant code                                     | Yes      |                   | string    |
| amount               | Cost of the item you want your customer to pay in Kobo e.g amount * 100       | Yes      |                   | number    |
| customer             | Customer information e.g email, first name, last name | No       |                   | object    |
| payItem              | Payment Item e.g id and name                          | Yes      |                   | object[]  |
| autoStart            | To auto initialize transaction                        | No       | false             | boolean   |
| indicatorColor       | activity indicator color                              | No       | red               | string    |
| currency             | ISO currency code e.g 566                             | Yes      | e.g 566           | number    |
| mode                 | Environment e.g LIVE, TEST                            | Yes      | TEST              | string    |
| onCompleted          | Callback that triggers when webview close or cancels  | Yes      |                   | Function  |
| splitAccounts        | ISW Split accounts for settlements                    | No       | `SplitAccounts[]` | Array     |
| showBackdrop        | Display loading backdrop                     | No       | false | boolean     |
| style        | WebView component custom style                   | No       | object | ViewStyle     |

| backButton        | custom back button style                   | No       | undefined | React Node      |


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
