import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

export type IswCustomer = {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
};

export type IswPayItem = {
  id: string;
  name?: string;
};

export type IswWebViewRefMethods = {
  start: () => void;
  end: () => void;
};

export type GetHtmlInputsFields = Omit<
  IswPaymentWebViewProps,
  'onCompleted' | 'onWebMessage' | 'autoStart' | 'checkoutUrl'
>;

export interface IswPaymentWebViewProps<T = {}> {
  /**
   * Customer information e.g email, first name, last name
   */
  customer?: IswCustomer;
  /**
   * Flag to indicate whether you want the customer's card to be tokenized, a tokenized value would be returned when you re-query to confirm the transaction status
   */
  tokeniseCard?: 'true' | 'false';
  /**
   * Payment Item
   */
  payItem: IswPayItem;

  /**
   * transaction reference
   */
  trnxRef?: string;

  /**
   * ISW merchant code
   */
  merchantCode: string;
  /**
   * Cost of the item you want your customer to pay in Kobo. (Your amount * 100)
   */
  amount: number | string;

  /**
   * to auto initialize transaction
   */
  autoStart?: boolean;

  /**
   * The callback function that returns the state of a transaction.
   *
   */
  onCompleted: (response: WebCheckoutPayResponse & T) => void;

  /**
   * Access token value gotten from passport
   */
  accessToken?: 'true' | 'false';

  /**
   * ISO currency code
   */
  currency?: number | string;
  /**
   * The mode of the payment
   */
  mode: 'TEST' | 'LIVE';
  /**
   * Indicator Color
   */
  indicatorColor?: ColorValue;

  /**
   * ISW Split accounts for settlements
   */
  splitAccounts?: SplitAccounts[];

  /**
   * Custom back button
   */
  backButton?: React.ReactNode;

  /**
   * Custom WebView component  style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Show backdrop
   */
  showBackdrop?: boolean;

  /**
   * Custom  loading Text
   */
  loadingText?: string;
}

export type IswTestMode = 'TEST' | 'LIVE';

export type SplitAccounts = {
  alias: string;
  amount?: number;
  description: string;
  percentage?: string;
  isPrimary?: boolean | string;
};

export interface WebCheckoutPayResponse {
  payRef: string;
  txnref?: string;
  amount: number | string;
  apprAmt: number | string;
  resp: string;
  desc?: string;
  retRef: string;
  cardNum: string;
  mac: string;
}
