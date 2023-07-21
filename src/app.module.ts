import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { ContractService } from './contract/contract.service';
import { EthersService } from './ethers/ethers.service';
import { EventListenerService } from './event-listener/event-listener.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/orderbook'),
    ConfigModule.forRoot(),
    OrderModule,
  ],
  controllers: [],
  providers: [ContractService, EthersService, EventListenerService],
})
export class AppModule {}
