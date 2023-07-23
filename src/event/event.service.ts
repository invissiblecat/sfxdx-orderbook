import { Injectable } from '@nestjs/common';
import { Contract, Event } from 'ethers';
import { ContractService } from 'src/contract/contract.service';
import { EthersService } from 'src/ethers/ethers.service';
import { OrderService } from 'src/order/order.service';
import {
  OrderCancelledEventEmittedResponse,
  OrderControllerEvents,
  OrderCreatedEventEmittedResponse,
  OrderMatchedEventEmittedResponse,
} from 'src/types/abi/order-controller';
import { makeId, makeOrderCreateDtoFromRawInfo } from 'src/utils/orders';

const GOERLI_MAX_BLOCKS_PER_GET = 5000;

type OrderControllerEventTypes =
  | OrderCreatedEventEmittedResponse
  | OrderMatchedEventEmittedResponse
  | OrderCancelledEventEmittedResponse;
@Injectable()
export class EventService {
  constructor(
    private orderSerice: OrderService,
    private contractSerice: ContractService,
    private ethersService: EthersService,
  ) {
    // this.syncOrders();
    // this.startAllListeners();
  }

  async syncOrders() {
    await this.syncOrderCreation();
    await this.syncOrderMatching();
    await this.startAllListeners();
  }

  async startAllListeners() {
    const orderController = this.contractSerice.getOrderControllerContract();

    this.startListener('OrderCreated', orderController);
    this.startListener('OrderMatched', orderController);
    this.startListener('OrderCancelled', orderController);
  }

  async startListener(
    eventName: OrderControllerEvents,
    orderController: Contract,
  ) {
    console.log(`start ${eventName}`);
    orderController.on(eventName, async (...args: any) => {
      console.log(`got ${eventName}`);

      const event = args[args.length - 1].args;
      console.log({ event });

      await this.eventActions(eventName, event);
    });
  }

  async eventActions(
    eventName: OrderControllerEvents,
    event: OrderControllerEventTypes,
  ) {
    switch (eventName) {
      case 'OrderCreated':
        await this.saveCreatedOrder(event as OrderCreatedEventEmittedResponse);
        break;
      case 'OrderMatched':
        await this.orderSerice.saveMatchingOrder(
          event as OrderMatchedEventEmittedResponse,
        );
        break;
      case 'OrderCancelled':
        await this.orderSerice.cancelOrder(
          event as OrderCancelledEventEmittedResponse,
        );
        break;
      default:
        return;
    }
  }

  async saveCreatedOrder(event: OrderCreatedEventEmittedResponse) {
    const orderInfo = await this.contractSerice.getOrderInfo(makeId(event.id));
    const createOrderDto = makeOrderCreateDtoFromRawInfo(orderInfo, {
      args: event,
    });
    await this.orderSerice.create(createOrderDto);
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
