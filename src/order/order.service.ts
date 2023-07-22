import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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

  create(createOrderDto: CreateOrderDto) {
    return new this.orderModel(createOrderDto).save();
  }

  findAll() {
    return this.orderModel.find();
  }

  findById(id: string) {
    return this.orderModel.findById(id).populate('matchingOrderIds');
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  updateByBlockchainId(id: string, matchingOrderIds: string[] = []) {
    if (matchingOrderIds.length) {
      this.orderModel.findOneAndUpdate(
        { id },
        {
          $push: { matchingOrders: [matchingOrderIds] },
        },
      );
    }
  }

  async batchCreateOrders(orders: CreateOrderDto[]) {
    for (const order of orders) {
      await this.create(order);
    }
  }

  saveMatchingOrder(orderMatchedEvent: OrderMatchedEventEmittedResponse) {
    const matchedId = orderMatchedEvent.matchedId.toString();
    if (matchedId === '0') return; //if order owner is initiator
    const newOrderId = orderMatchedEvent.id.toString();

    this.updateByBlockchainId(newOrderId, [newOrderId]);
  }

  async batchSaveMatchingOrders(
    orderMatchedEvents: OrderMatchedEventEmittedResponse[],
  ) {
    orderMatchedEvents.forEach((event) => this.saveMatchingOrder(event));
  }
}
