import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { parseUnits } from 'ethers/lib/utils';

@Injectable()
export class AmountValidationPipe implements PipeTransform<any> {
  async transform(value: string) {
    try {
      if (!value.includes('.')) return value;
      return parseUnits(value).toString();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
