# Interswitch Payment Gateway SDK for React Native

<img width="259" alt="Interswitch" src="https://business.quickteller.com/assets/images/app-logo.svg">

The **Interswitch Payment Gateway (IPG) SDK** for React Native provides a seamless way to integrate secure payment processing into your mobile applications. Built on top of the robust Interswitch Web Checkout, this SDK simplifies the integration process using a high-performance WebView component.

[Official Documentation](https://docs.interswitchgroup.com/docs/web-checkout)

---

## Features

- **Official Integration**: Follows [Interswitch Inline Checkout](https://docs.interswitchgroup.com/docs/web-checkout#option-1---inline-checkout) standards.
- **Cross-Platform**: Full support for both **Expo** and **React Native CLI**.
- **Type Safety**: Built with **TypeScript** for a superior developer experience and fewer runtime errors.
- **Customizable**: Control the payment flow with refs, handle custom response data, and style the UI to match your app.

## Installation

Install the package via your preferred package manager:

### NPM

```sh
npm install @interswitchapi/ipg-react-native
```

### Yarn

```sh
yarn add @interswitchapi/ipg-react-native
```

### Expo

```sh
npx expo install @interswitchapi/ipg-react-native
```

> [!IMPORTANT]
> This package requires `react-native-webview` as a peer dependency. Ensure it is installed in your project.

---

## Quick Start

The following example demonstrates a basic implementation where the payment modal starts automatically.

```tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { IswPaymentWebView } from '@interswitchapi/ipg-react-native';

export default function App() {
  const [txnRef] = useState(`txn_${Date.now()}`);

  const config = {
    merchantCode: 'MX6072',
    payItemId: '9405967',
    amount: 100000, // Amount in Kobo (e.g., 1000.00 NGN)
    mode: 'TEST' as const,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Payment</Text>
      <IswPaymentWebView
        amount={config.amount}
        autoStart={true}
        trnxRef={txnRef}
        merchantCode={config.merchantCode}
        payItem={{ id: config.payItemId }}
        mode={config.mode}
        onCompleted={(response) => {
          console.log('Payment Response:', response);
        }}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  webView: { flex: 1 },
});
```

---

## Advanced Usage

### Manual Trigger with Refs

Use the `IswWebViewRefMethods` to programmatically `start()` or `end()` the payment process.

```tsx
import React, { useRef } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import {
  IswPaymentWebView,
  type IswWebViewRefMethods,
} from '@interswitchapi/ipg-react-native';

export default function PaymentScreen() {
  const paymentRef = useRef<IswWebViewRefMethods>(null);

  return (
    <>
      <TouchableOpacity onPress={() => paymentRef.current?.start()}>
        <Text>Pay Now</Text>
      </TouchableOpacity>

      <IswPaymentWebView
        ref={paymentRef}
        autoStart={false}
        // ... other props
        onCompleted={(res) => console.log(res)}
      />
    </>
  );
}
```

### Handling Custom Response Data

You can pass a generic type to `IswPaymentWebView` to handle custom data fields returned in the payment callback.

```tsx
interface MyCustomData {
  orderId: string;
  userId: string;
}

// ... inside your component
<IswPaymentWebView<MyCustomData>
  onCompleted={(response) => {
    console.log('Order ID:', response.orderId);
  }}
  // ...
/>;
```

---

## API Reference: Props

| Prop             | Type                | Required | Default | Description                                                 |
| :--------------- | :------------------ | :------: | :------ | :---------------------------------------------------------- |
| `trnxRef`        | `string`            | **Yes**  | -       | Unique transaction reference for the session.               |
| `merchantCode`   | `string`            | **Yes**  | -       | Your Interswitch Merchant Code.                             |
| `amount`         | `number \| string`  | **Yes**  | -       | Transaction amount in **Kobo** (e.g., `100000` = 1000.00).  |
| `payItem`        | `IswPayItem`        | **Yes**  | -       | Object containing `id` (required) and `name` (optional).    |
| `mode`           | `'TEST' \| 'LIVE'`  | **Yes**  | -       | Environment for the transaction.                            |
| `onCompleted`    | `Function`          | **Yes**  | -       | Callback triggered upon completion, cancellation, or error. |
| `currency`       | `number \| string`  |    No    | `566`   | ISO currency code (Default: 566 for NGN).                   |
| `customer`       | `IswCustomer`       |    No    | -       | Optional customer details (id, name, email, phoneNumber).   |
| `autoStart`      | `boolean`           |    No    | `false` | Automatically launch the payment modal on mount.            |
| `showBackdrop`   | `boolean`           |    No    | `false` | Display a loading backdrop while the gateway initializes.   |
| `indicatorColor` | `ColorValue`        |    No    | -       | Color for the loading activity indicator.                   |
| `loadingText`    | `string`            |    No    | -       | Custom text displayed during initialization.                |
| `style`          | `ViewStyle`         |    No    | -       | custom styles for the WebView component.                    |
| `backButton`     | `ReactNode`         |    No    | -       | Custom component for the back/close button.                 |
| `tokeniseCard`   | `'true' \| 'false'` |    No    | -       | Flag to request card tokenization for future use.           |
| `splitAccounts`  | `SplitAccounts[]`   |    No    | -       | Array of accounts for settlement splitting.                 |

---

## Contributing

We welcome contributions! Please see the [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

_Built with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)_
