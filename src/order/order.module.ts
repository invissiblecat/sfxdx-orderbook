import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderSchema } from '../schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractService } from 'src/contract/contract.service';
import { EthersService } from 'src/ethers/ethers.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService, ContractService, EthersService],
  exports: [OrderService],
})
export class OrderModule {}
