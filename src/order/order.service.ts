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
import _ from 'lodash';
import { makeId, makeUpdateOrderDtoFromRawInfo } from 'src/utils/orders';
import { ContractService } from 'src/contract/contract.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order')
    private orderModel: Model<Order>,
    private contractService: ContractService,
  ) {}

  async createOrUpdate(createOrderDto: CreateOrderDto) {
    const isCreated = await this.create(createOrderDto);
    if (isCreated) return;

    await this.updateById({
      _id: createOrderDto._id,
      updateData: _.omit(createOrderDto, ['_id']),
    });
  }

  async create(createOrderDto: CreateOrderDto) {
    const createdOrder = await this.findById(createOrderDto._id);
    if (createdOrder) return;

    return new this.orderModel(createOrderDto).save();
  }

  async batchCreateOrders(orders: CreateOrderDto[]) {
    for (const order of orders) {
      await this.createOrUpdate(order);
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
    if (!order) return;

    if (matchingOrderIds && matchingOrderIds.length) {
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
    }

    if (updateData) {
      await this.orderModel.findByIdAndUpdate(_id, { $set: updateData });
    }
    return true;
  }

  async saveMatchingOrder(orderMatchedEvent: OrderMatchedEventEmittedResponse) {
    const matchedId = makeId(orderMatchedEvent.matchedId);
    if (matchedId === makeId('0')) return; //if order owner is initiator
    const newOrderId = makeId(orderMatchedEvent.id);

    const newOrderInfo = await this.getUpdateOrderDto(newOrderId);
    const matchedInfo = await this.getUpdateOrderDto(matchedId);

    const iSuccess = await this.updateById({
      _id: newOrderId,
      matchingOrderIds: [matchedId],
      updateData: newOrderInfo,
    });
    if (!iSuccess) return false;

    await this.updateById({
      _id: matchedId,
      matchingOrderIds: [newOrderId],
      updateData: matchedInfo,
    });
    return true;
  }

  async batchSaveMatchingOrders(
    orderMatchedEvents: OrderMatchedEventEmittedResponse[],
  ) {
    const successfulEvents = [];
    for (const event of orderMatchedEvents) {
      const isSuccess = await this.saveMatchingOrder(event);
      if (isSuccess) successfulEvents.push(event);
    }
    return successfulEvents;
  }

  async cancelOrder(event: OrderCancelledEventEmittedResponse) {
    await this.updateById({
      _id: makeId(event.id),
      updateData: { status: OrderStatus.CANCELLED },
    });
  }

  async getUpdateOrderDto(_id: string) {
    const orderInfo = await this.contractService.getOrderInfo(_id);
    return makeUpdateOrderDtoFromRawInfo(orderInfo);
  }
}
