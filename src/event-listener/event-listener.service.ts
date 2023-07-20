import { Injectable } from '@nestjs/common';
import { Event } from 'ethers';
import { ContractService } from 'src/contract/contract.service';
import { EthersService } from 'src/ethers/ethers.service';
import { OrderService } from 'src/order/order.service';

const GOERLI_MAX_BLOCKS_PER_GET = 5000;

@Injectable()
export class EventListenerService {
  constructor(
    private orderSerice: OrderService,
    private contractSerice: ContractService,
    private ethersService: EthersService,
  ) {
    this.syncPreviousEvents();
  }

  async syncPreviousEvents() {
    const events = await this.getAllEvents();
  }

  async getAllEvents() {
    const orderController = this.contractSerice.getOrderControllerContract();

    const provider = this.ethersService.getProvider();
    const currentLastBlock = await provider.getBlockNumber();

    let fromBlock = 0;
    const eventPromises = [];
    for (
      let toBlock = GOERLI_MAX_BLOCKS_PER_GET;
      toBlock <= currentLastBlock;
      toBlock += GOERLI_MAX_BLOCKS_PER_GET
    ) {
      const promise = orderController.queryFilter('*', fromBlock, toBlock);
      eventPromises.push(promise);
      fromBlock = toBlock;
    }
    eventPromises.push(
      orderController.queryFilter('*', fromBlock, currentLastBlock),
    );

    const eventsByBlocks = await Promise.all(eventPromises);

    const events = eventsByBlocks.reduce<Event[]>((result, eventsByBlock) => {
      if (!eventsByBlock.length) return result;
      result = [...result, ...eventsByBlock];
      return result;
    }, []);

    return events;
  }
}
