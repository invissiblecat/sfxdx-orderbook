import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { ContractService } from './contract/contract.service';
import { EthersService } from './ethers/ethers.service';
import dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://localhost:27017/orderbook',
      autoLoadEntities: true,
      synchronize: true,
    }),
    OrderModule,
  ],
  controllers: [],
  providers: [ContractService, EthersService],
})
export class AppModule {}
