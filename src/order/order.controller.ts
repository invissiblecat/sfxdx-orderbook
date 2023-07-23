/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Controller, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiQuery } from '@nestjs/swagger';
import { AnyObject, FilterQuery } from 'mongoose';
import { Order, OrderStatus } from 'src/schemas/order.schema';
import { AddressValidationPipe } from 'src/pipes/address-validation.pipe';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/getOrders')
  @ApiQuery({
    name: 'tokenA',
    required: false,
  })
  @ApiQuery({
    name: 'tokenB',
    required: false,
  })
  @ApiQuery({
    name: 'user',
    required: false,
  })
  @ApiQuery({
    name: 'active',
    required: false,
  })
  async findAll(
    @Query('tokenA', AddressValidationPipe) tokenA?: string,
    @Query('tokenB', AddressValidationPipe) tokenB?: string,
    @Query('user', AddressValidationPipe) user?: string,
    @Query('active') active: boolean = false,
  ) {
    const filter = this.constructFilterQuery({
      tokenToSell: tokenA,
      tokenToBuy: tokenB,
      user,
      active,
    });
    return this.orderService.findAll(filter);
  }

  constructFilterQuery(fields: AnyObject) {
    const filterQuery: FilterQuery<Order> = {};

    const names = Object.keys(fields);
    const values = Object.values(fields);

    values.forEach((value, i) => {
      if (names[i] === 'active') {
        const status = this.convertActiveToStatus(value);
        if (status) filterQuery['status'] = status;
        return;
      }
      if (typeof value === 'string')
        filterQuery[names[i]] = this.constructCaseUnsensitiveRegExp(value);
    });

    return filterQuery;
  }

  convertActiveToStatus(active: boolean) {
    if (active) {
      return {
        $in: [OrderStatus.ACTIVE, OrderStatus.PARTIALLY_FILLED],
      };
    }
    return {
      $in: [OrderStatus.FILLED, OrderStatus.CANCELLED],
    };
  }

  constructCaseUnsensitiveRegExp(addressLike: string) {
    return {
      $regex: addressLike,
      $options: 'i',
    };
  }
}
