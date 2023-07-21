import { Injectable } from '@nestjs/common';
import { Event } from 'ethers';
import { ContractService } from 'src/contract/contract.service';
import { EthersService } from 'src/ethers/ethers.service';
import { OrderService } from 'src/order/order.service';
import { OrderCreatedEventEmittedResponse } from 'src/types/abi/order-controller';
import { makeOrderCreateDtoFromRawInfo } from 'src/utils/orders';

const GOERLI_MAX_BLOCKS_PER_GET = 5000;

@Injectable()
export class EventListenerService {
  constructor(
    private orderSerice: OrderService,
    private contractSerice: ContractService,
    private ethersService: EthersService,
  ) {
    this.syncOrders();
  }

  async syncOrders() {
    const events = await this.getPreviousEvents();

    const orderIds = this.getOrderIdsFromEvents(events);
    const orders = await this.contractSerice.batchGetOrdersInfo(orderIds);
    const createOrderDtos = orders.map((order, i) =>
      makeOrderCreateDtoFromRawInfo(order, events[i]),
    );
    await this.orderSerice.batchCreateOrders(createOrderDtos);
  }

  async getPreviousEvents() {
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
      const promise = orderController.queryFilter(
        'OrderCreated',
        fromBlock,
        toBlock,
      );
      eventPromises.push(promise);
      fromBlock = toBlock;
    }
    eventPromises.push(
      orderController.queryFilter('OrderCreated', fromBlock, currentLastBlock), //todo response err handle
    );

    const eventsByBlocks = await Promise.all(eventPromises);

    const events = eventsByBlocks.reduce<Event[]>((result, eventsByBlock) => {
      if (!eventsByBlock.length) return result;
      result = [...result, ...eventsByBlock];
      return result;
    }, []);

    return events as unknown as { args: OrderCreatedEventEmittedResponse }[];
  }

  getOrderIdsFromEvents(events: { args: OrderCreatedEventEmittedResponse }[]) {
    return events.map((event) => event.args.id.toString());
  }
}
