import { Column, Entity, ManyToOne, ObjectIdColumn, OneToMany } from 'typeorm';

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
}

@Entity()
export class Order {
  @ObjectIdColumn()
  id: string;

  @Column()
  type: OrderType;

  @Column()
  status: OrderStatus;

  @Column()
  tokenA: string;

  @Column()
  tokenB: string;

  @Column()
  amountA: string;

  @Column()
  amountB: string;

  @Column()
  amountLeftToFill: string;

  @Column()
  fees: string;

  @Column()
  user: string;

  @Column()
  isCancelled: boolean;

  @OneToMany(() => Order, (order) => order.parentOrder)
  childOrders: Order[];

  @ManyToOne(() => Order, (order) => order.childOrders)
  parentOrder: Order;
}
