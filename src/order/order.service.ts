import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from '../schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  OrderCancelledEventEmittedResponse,
  OrderMatchedEventEmittedResponse,
} from 'src/types/abi/order-controller';
import { UpdateOrderDto } from './dto/update-order.dto';
import { makeId } from 'src/utils/orders';

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

  async findAll(filter: FilterQuery<Order>) {
    return this.orderModel.find(filter).populate('matchingOrders');
  }

  findById(_id: string) {
    return this.orderModel.findOne({ _id }).populate('matchingOrders');
  }

  async updateById({
    _id,
    matchingOrderIds,
    updateData,
  }: {
    _id: string;
    matchingOrderIds?: string[];
    updateData?: UpdateOrderDto;
  }) {
    const order = await this.findById(_id);
    console.log({ _id });

    const createdMatchingOrderIds = order.matchingOrders.map(
      (matchingOrder) => matchingOrder._id,
    );

    const newMatchingOrderIds = matchingOrderIds.filter(
      (id) => !createdMatchingOrderIds.includes(id),
    );
    if (newMatchingOrderIds.length) {
      await this.orderModel.findByIdAndUpdate(_id, {
        $push: { matchingOrders: { $each: newMatchingOrderIds } },
      });
    }

    if (updateData) {
      await this.orderModel.findByIdAndUpdate(_id, { $set: updateData });
    }
  }

  async saveMatchingOrder(orderMatchedEvent: OrderMatchedEventEmittedResponse) {
    const matchedId = makeId(orderMatchedEvent.matchedId);
    if (matchedId === makeId('0')) return; //if order owner is initiator
    const newOrderId = makeId(orderMatchedEvent.id);

    await this.updateById({ _id: matchedId, matchingOrderIds: [newOrderId] });
    await this.updateById({ _id: newOrderId, matchingOrderIds: [matchedId] });
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

  async cancelOrder(event: OrderCancelledEventEmittedResponse) {
    await this.updateById({
      _id: makeId(event.id),
      updateData: { status: OrderStatus.CANCELLED },
    });
  }
}
