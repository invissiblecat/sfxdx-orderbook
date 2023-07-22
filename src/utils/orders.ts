import { BigNumber } from 'ethers';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { OrderStatus, OrderType } from 'src/schemas/order.schema';
import {
  GetOrderInfoResponse,
  OrderCreatedEventEmittedResponse,
} from 'src/types/abi/order-controller';

export const makeOrderCreateDtoFromRawInfo = (
  rawOrderInfo: GetOrderInfoResponse,
  event: { args: OrderCreatedEventEmittedResponse },
) => {
  const amountLeftToFill = rawOrderInfo[3];
  const isCancelled = rawOrderInfo[8];
  const amountToBuy = rawOrderInfo[1];
  const status = makeOrderStatus(amountLeftToFill, isCancelled, amountToBuy);

  const createDto: CreateOrderDto = {
    _id: rawOrderInfo[0].toString(),
    type: event.args.isMarket ? OrderType.MARKET : OrderType.LIMIT,
    status,
    tokenToSell: rawOrderInfo[6].toLowerCase(),
    tokenToBuy: rawOrderInfo[5].toLowerCase(),
    amountToSell: rawOrderInfo[2].toString(),
    amountToBuy: amountToBuy.toString(),
    amountLeftToFill: amountLeftToFill.toString(),
    fees: rawOrderInfo[4].toString(),
    user: rawOrderInfo[7].toString(),
  };

  return createDto;
};

const makeOrderStatus = (
  amountLeftToFill: BigNumber,
  isCancelled: boolean,
  amountToBuy: BigNumber,
) => {
  if (isCancelled) return OrderStatus.CANCELLED;
  if (amountLeftToFill.eq(0)) return OrderStatus.FILLED;
  if (amountLeftToFill.lt(amountToBuy)) return OrderStatus.PARTIALLY_FILLED;
  return OrderStatus.ACTIVE;
};
