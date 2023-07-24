import { BigNumber, BigNumberish } from 'ethers';
import { AnyObject, FilterQuery } from 'mongoose';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { Order, OrderStatus, OrderType } from 'src/schemas/order.schema';
import {
  GetOrderInfoResponse,
  OrderCreatedEventEmittedResponse,
} from 'src/types/abi/order-controller';
import _ from 'lodash';

export const makeOrderCreateDtoFromRawInfo = (
  rawOrderInfo: GetOrderInfoResponse,
  event?: OrderCreatedEventEmittedResponse,
) => {
  const status = makeOrderStatus(rawOrderInfo);

  const type = event
    ? event.isMarket
      ? OrderType.MARKET
      : OrderType.LIMIT
    : undefined;

  const createDto: CreateOrderDto = {
    _id: makeId(rawOrderInfo[0]),
    type,
    status,
    tokenToSell: rawOrderInfo[6].toLowerCase(),
    tokenToBuy: rawOrderInfo[5].toLowerCase(),
    amountToSell: rawOrderInfo[2].toString(),
    amountToBuy: rawOrderInfo[1].toString(),
    amountLeftToFill: rawOrderInfo[3].toString(),
    fees: rawOrderInfo[4].toString(),
    user: rawOrderInfo[7].toString(),
  };

  return createDto;
};

export const makeUpdateOrderDtoFromRawInfo = (
  rawOrderInfo: GetOrderInfoResponse,
  event?: OrderCreatedEventEmittedResponse,
) => {
  const info = makeOrderCreateDtoFromRawInfo(rawOrderInfo, event);
  return _.omit(info, ['_id']);
};

export const makeOrderStatus = (rawOrderInfo: GetOrderInfoResponse) => {
  const amountLeftToFill = rawOrderInfo[3];
  const isCancelled = rawOrderInfo[8];
  const amountToBuy = rawOrderInfo[1];

  if (isCancelled) return OrderStatus.CANCELLED;
  if (amountLeftToFill.eq(0)) return OrderStatus.FILLED;
  if (amountLeftToFill.lt(amountToBuy)) return OrderStatus.PARTIALLY_FILLED;
  return OrderStatus.ACTIVE;
};

export const constructFilterQuery = (fields: AnyObject) => {
  const filterQuery: FilterQuery<Order> = {};

  const names = Object.keys(fields);
  const values = Object.values(fields);

  values.forEach((value, i) => {
    if (names[i] === 'active' && typeof value === 'boolean') {
      const status = convertActiveToStatus(value);
      if (status) filterQuery['status'] = status;
      return;
    }
    if (typeof value === 'string') {
      filterQuery[names[i]] = constructCaseUnsensitiveRegExp(value);
    }
  });

  return filterQuery;
};

export const convertActiveToStatus = (active: boolean) => {
  if (active) {
    return {
      $in: [OrderStatus.ACTIVE, OrderStatus.PARTIALLY_FILLED],
    };
  }
  return {
    $in: [OrderStatus.FILLED, OrderStatus.CANCELLED],
  };
};

export const constructCaseUnsensitiveRegExp = (addressLike: string) => {
  return {
    $regex: addressLike,
    $options: 'i',
  };
};

export const makeId = (rawId: BigNumberish) =>
  BigNumber.from(rawId).toHexString();
