import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum OrderType {
  LIMIT = 'limit',
  MARKET = 'market',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  ACTIVE = 'active',
  PARTIALLY_FILLED = 'partially filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
  @Prop()
  id: string;

  @Prop()
  type: OrderType;

  @Prop()
  status: OrderStatus;

  @Prop()
  tokenToSell: string;

  @Prop()
  tokenToBuy: string;

  @Prop()
  amountToSell: string;

  @Prop()
  amountToBuy: string;

  @Prop()
  amountLeftToFill: string;

  @Prop()
  fees: string;

  @Prop()
  user: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }] })
  matchingOrders: Order[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
