import { Injectable } from '@nestjs/common';
import { Event } from 'ethers';
import { ContractService } from 'src/contract/contract.service';
import { EthersService } from 'src/ethers/ethers.service';
import { OrderService } from 'src/order/order.service';
import {
  OrderControllerEvents,
  OrderCreatedEventEmittedResponse,
  OrderMatchedEventEmittedResponse,
} from 'src/types/abi/order-controller';
import { makeOrderCreateDtoFromRawInfo } from 'src/utils/orders';

const GOERLI_MAX_BLOCKS_PER_GET = 5000;

@Injectable()
export class EventService {
  constructor(
    private orderSerice: OrderService,
    private contractSerice: ContractService,
    private ethersService: EthersService,
  ) {
    this.syncOrders();
  }

  async syncOrders() {
    await this.syncOrderCreation();
    await this.syncOrderMatching();
  }

  async syncOrderCreation() {
    const orderCreatedEvents = await this.getPreviousEvents('OrderCreated');

    const orderIds = this.getOrderIdsFromEvents(orderCreatedEvents);
    const orders = await this.contractSerice.batchGetOrdersInfo(orderIds);
    const createOrderDtos = orders.map((order, i) =>
      makeOrderCreateDtoFromRawInfo(
        order,
        orderCreatedEvents[i] as unknown as {
          args: OrderCreatedEventEmittedResponse;
        },
      ),
    );
    await this.orderSerice.batchCreateOrders(createOrderDtos);
  }

  async syncOrderMatching() {
    const orderMatchedEvents = (await this.getPreviousEvents(
      'OrderMatched',
    )) as unknown as { args: OrderMatchedEventEmittedResponse }[];
    this.orderSerice.batchSaveMatchingOrders(orderMatchedEvents);
  }

  async getPreviousEvents(eventName: OrderControllerEvents) {
    const orderController = this.contractSerice.getOrderControllerContract();

    try {
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
          eventName,
          fromBlock,
          toBlock,
        );
        eventPromises.push(promise);
        fromBlock = toBlock;
      }
      eventPromises.push(
        orderController.queryFilter(eventName, fromBlock, currentLastBlock), //todo response err handle
      );

      const eventsByBlocks = await Promise.all(eventPromises);

      const events = eventsByBlocks.reduce<Event[]>((result, eventsByBlock) => {
        if (!eventsByBlock.length) return result;
        result = [...result, ...eventsByBlock];
        return result;
      }, []);

      return events as { args: any }[];
    } catch (error) {
      throw new Error(error); //Error: Error: missing response
    }
  }

  getOrderIdsFromEvents(events: { args: any }[]) {
    return events.map((event) => event.args.id.toString());
  }
}
