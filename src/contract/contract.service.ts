import { Injectable } from '@nestjs/common';
import { Contract } from 'ethers';
import { OrderController } from 'src/types/abi/order-controller';
import { getFromEnv } from 'src/utils/envChecker';
import OrderControllerAbi from '../abi/order-controller.abi.json';
import { EthersService } from 'src/ethers/ethers.service';

@Injectable()
export class ContractService {
  private orderControllerContract: OrderController;

  constructor(private ethersService: EthersService) {
    const address = getFromEnv('CONTRACT_ADDRESS');
    const provider = this.ethersService.getProvider();

    this.orderControllerContract = new Contract(
      address,
      OrderControllerAbi,
      provider,
    ) as unknown as OrderController;
  }

  getOrderControllerContract() {
    return this.orderControllerContract;
  }
}
