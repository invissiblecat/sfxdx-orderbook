import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '../schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderMatchedEventEmittedResponse } from 'src/types/abi/order-controller';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order')
    private orderModel: Model<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const createdOrder = await this.findById(createOrderDto._id);
    if (createdOrder) return;
    return new this.orderModel(createOrderDto).save();
  }

  async batchCreateOrders(orders: CreateOrderDto[]) {
    for (const order of orders) {
      await this.create(order);
    }
  }

  findAll() {
    return this.orderModel.find();
  }

  findById(_id: string) {
    return this.orderModel.findOne({ _id }).populate('matchingOrders');
  }

  async updateById(_id: string, matchingOrderIds: string[] = []) {
    const order = await this.findById(_id);
    const createdMatchingOrderIds = order.matchingOrders.map(
      (matchingOrder) => matchingOrder._id,
    );

    const newMatchingOrderIds = matchingOrderIds.filter(
      (id) => !createdMatchingOrderIds.includes(id),
    );
    if (newMatchingOrderIds.length) {
      const res = await this.orderModel.findByIdAndUpdate(_id, {
        $push: { matchingOrders: { $each: newMatchingOrderIds } },
      });
      console.log({ res });
    }
  }

  async saveMatchingOrder(orderMatchedEvent: OrderMatchedEventEmittedResponse) {
    const matchedId = orderMatchedEvent.matchedId.toString();
    if (matchedId === '0') return; //if order owner is initiator
    const newOrderId = orderMatchedEvent.id.toString();

    await this.updateById(newOrderId, [matchedId]);
    await this.updateById(matchedId, [newOrderId]);
  }

  async batchSaveMatchingOrders(
    orderMatchedEvents: {
      args: OrderMatchedEventEmittedResponse;
    }[],
  ) {
    for (const { args } of orderMatchedEvents) {
      await this.saveMatchingOrder(args);
    }
  }
}
