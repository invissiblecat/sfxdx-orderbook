import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '../schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order')
    private orderModel: Model<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    return new this.orderModel(createOrderDto).save();
  }

  findAll() {
    return this.orderModel.find();
  }

  findOne(id: string) {
    return `This action returns a #${id} order`;
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async batchCreateOrders(orders: CreateOrderDto[]) {
    orders.forEach((order) => this.create(order));
    console.log(`here`);
  }
}
