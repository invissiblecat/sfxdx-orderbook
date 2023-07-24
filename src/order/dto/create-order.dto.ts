import { OrderStatus, OrderType } from '../../schemas/order.schema';

export class CreateOrderDto {
  _id: string;
  type?: OrderType;
  status: OrderStatus;
  tokenToSell: string; //token b
  tokenToBuy: string; //token a
  amountToSell: string;
  amountToBuy: string;
  amountLeftToFill: string;
  fees: string;
  user: string;
}
