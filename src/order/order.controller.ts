/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Controller, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiQuery } from '@nestjs/swagger';
import { AddressValidationPipe } from 'src/pipes/address-validation.pipe';
import { constructFilterQuery } from 'src/utils/orders';
import { AmountValidationPipe } from 'src/pipes/amount-validation.pipe';
import { Order } from 'src/schemas/order.schema';
import { BigNumber } from 'ethers';

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
  async getOrders(
    @Query('tokenA', AddressValidationPipe) tokenToBuy?: string,
    @Query('tokenB', AddressValidationPipe) tokenToSell?: string,
    @Query('user', AddressValidationPipe) user?: string,
    @Query('active') active: boolean = false,
  ) {
    const filter = constructFilterQuery({
      tokenToSell,
      tokenToBuy,
      user,
      active,
    });
    return this.orderService.findAll(filter);
  }

  @Get('/getMatchingOrders')
  async getMatchingOrders(
    @Query('tokenA', AddressValidationPipe) tokenToSell?: string,
    @Query('tokenB', AddressValidationPipe) tokenToBuy?: string,
    @Query('amountA', AmountValidationPipe) amountToSell?: string,
    @Query('amountB', AmountValidationPipe) amountToBuy?: string,
  ) {
    const filter = constructFilterQuery({
      tokenToSell,
      tokenToBuy,
      active: true,
    });
    const orders = await this.orderService.findAll(filter);
    const filteredOrders = orders.reduce<Order[]>((result, order) => {
      const readyToSell = result.reduce((sum, current) => {
        sum = sum.add(current.amountToBuy);
        return sum;
      }, BigNumber.from(0));

      const readyToBuy = result.reduce((sum, current) => {
        sum = sum.add(current.amountToSell);
        return sum;
      }, BigNumber.from(0));

      if (
        readyToSell.add(order.amountToBuy).lte(BigNumber.from(amountToSell)) &&
        readyToBuy.add(amountToSell).lte(BigNumber.from(amountToBuy))
      ) {
        result.push(order);
      }

      return result;
    }, []);

    const readyToSell = filteredOrders.reduce((sum, current) => {
      sum = sum.add(current.amountToBuy);
      return sum;
    }, BigNumber.from(0));

    const readyToBuy = filteredOrders.reduce((sum, current) => {
      sum = sum.add(current.amountToSell);
      return sum;
    }, BigNumber.from(0));

    console.log({
      readyToBuy: readyToBuy.toString(),
      readyToSell: readyToSell.toString(),
    });

    const ids = filteredOrders.map((order) => order._id);
    return ids;
  }
}
