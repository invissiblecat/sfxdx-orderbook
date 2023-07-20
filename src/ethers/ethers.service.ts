import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { getFromEnv } from 'src/utils/envChecker';

@Injectable()
export class EthersService {
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    const infuraUrl = getFromEnv('INFURA_URL');
    const apiKey = getFromEnv('API_KEY');
    const providerUrl = infuraUrl + '/' + apiKey;

    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
  }

  getProvider() {
    return this.provider;
  }
}
