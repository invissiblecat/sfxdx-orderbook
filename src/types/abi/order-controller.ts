import { ContractTransaction, BigNumberish, BigNumber } from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  OrderController,
  OrderControllerMethodNames,
  OrderControllerEventsContext,
  OrderControllerEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type OrderControllerEvents =
  | 'FeeRateChanged'
  | 'OrderCancelled'
  | 'OrderCreated'
  | 'OrderMatched'
  | 'OwnershipTransferred';
export interface OrderControllerEventsContext {
  FeeRateChanged(...parameters: any): EventFilter;
  OrderCancelled(...parameters: any): EventFilter;
  OrderCreated(...parameters: any): EventFilter;
  OrderMatched(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
}
export type OrderControllerMethodNames =
  | 'new'
  | 'cancelOrder'
  | 'createOrder'
  | 'feeRate'
  | 'getAccumulatedFeeBalance'
  | 'getOrderId'
  | 'getOrderIdLength'
  | 'getOrderInfo'
  | 'getUserOrderIds'
  | 'getUserOrderIdsLength'
  | 'matchOrders'
  | 'owner'
  | 'renounceOwnership'
  | 'setFee'
  | 'transferOwnership'
  | 'withdrawFee';
export interface FeeRateChangedEventEmittedResponse {
  oldFeeRate: BigNumberish;
  newFeeRate: BigNumberish;
}
export interface OrderCancelledEventEmittedResponse {
  id: BigNumberish;
}
export interface OrderCreatedEventEmittedResponse {
  id: BigNumberish;
  amountA: BigNumberish;
  amountB: BigNumberish;
  tokenA: string;
  tokenB: string;
  user: string;
  isMarket: boolean;
}
export interface OrderMatchedEventEmittedResponse {
  id: BigNumberish;
  matchedId: BigNumberish;
  amountReceived: BigNumberish;
  amountPaid: BigNumberish;
  amountLeftToFill: BigNumberish;
  fee: BigNumberish;
  feeRate: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface GetOrderInfoResponse {
  result0: BigNumber;
  0: BigNumber;
  result1: BigNumber;
  1: BigNumber;
  result2: BigNumber;
  2: BigNumber;
  result3: BigNumber;
  3: BigNumber;
  result4: BigNumber;
  4: BigNumber;
  result5: string;
  5: string;
  result6: string;
  6: string;
  result7: string;
  7: string;
  result8: boolean;
  8: boolean;
  length: 9;
}
export interface OrderController {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param fee Type: uint256, Indexed: false
   */
  'new'(
    fee: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param id Type: uint256, Indexed: false
   */
  cancelOrder(
    id: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenA Type: address, Indexed: false
   * @param tokenB Type: address, Indexed: false
   * @param amountA Type: uint256, Indexed: false
   * @param amountB Type: uint256, Indexed: false
   */
  createOrder(
    tokenA: string,
    tokenB: string,
    amountA: BigNumberish,
    amountB: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  feeRate(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param token Type: address, Indexed: false
   */
  getAccumulatedFeeBalance(
    token: string,
    overrides?: ContractCallOverrides,
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param index Type: uint256, Indexed: false
   */
  getOrderId(
    index: BigNumberish,
    overrides?: ContractCallOverrides,
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getOrderIdLength(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _id Type: uint256, Indexed: false
   */
  getOrderInfo(
    _id: BigNumberish,
    overrides?: ContractCallOverrides,
  ): Promise<GetOrderInfoResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param from Type: uint256, Indexed: false
   * @param length Type: uint256, Indexed: false
   */
  getUserOrderIds(
    from: BigNumberish,
    length: BigNumberish,
    overrides?: ContractCallOverrides,
  ): Promise<BigNumber[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getUserOrderIdsLength(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param matchedOrderIds Type: uint256[], Indexed: false
   * @param tokenA Type: address, Indexed: false
   * @param tokenB Type: address, Indexed: false
   * @param amountA Type: uint256, Indexed: false
   * @param amountB Type: uint256, Indexed: false
   * @param isMarket Type: bool, Indexed: false
   */
  matchOrders(
    matchedOrderIds: BigNumberish[],
    tokenA: string,
    tokenB: string,
    amountA: BigNumberish,
    amountB: BigNumberish,
    isMarket: boolean,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newFeeRate Type: uint256, Indexed: false
   */
  setFee(
    newFeeRate: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(
    newOwner: string,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param token Type: address, Indexed: false
   */
  withdrawFee(
    token: string,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
}
