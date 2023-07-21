import { Injectable } from '@nestjs/common';
import { Contract } from 'ethers';
import { getFromEnv } from 'src/utils/envChecker';
import OrderControllerAbi from '../abi/order-controller.abi.json';
import { EthersService } from 'src/ethers/ethers.service';
import {
  GetOrderInfoResponse,
  OrderController,
} from 'src/types/abi/order-controller';

@Injectable()
export class ContractService {
  private orderControllerContract: Contract;
  constructor(private ethersService: EthersService) {
    const address = getFromEnv('CONTRACT_ADDRESS');
    const provider = this.ethersService.getProvider();

    this.orderControllerContract = new Contract(
      address,
      OrderControllerAbi,
      provider,
    );
  }

  getOrderControllerContract() {
    return this.orderControllerContract;
  }

  async getOrderInfo(orderId: string) {
    const order = await (
      this.orderControllerContract as unknown as OrderController
    ).getOrderInfo(orderId);
    return order;
  }

  async batchGetOrdersInfo(orderIds: string[]) {
    const orderPromises = [];
    for (const orderId of orderIds) {
      orderPromises.push(this.getOrderInfo(orderId));
    }
    const orders = await Promise.all(orderPromises);
    return orders as GetOrderInfoResponse[];
  }
}
