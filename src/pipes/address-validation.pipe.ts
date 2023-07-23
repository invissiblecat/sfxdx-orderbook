import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isAddress } from 'ethers/lib/utils';

@Injectable()
export class AddressValidationPipe implements PipeTransform<any> {
  async transform(value: string | undefined) {
    if (!value) return;
    if (!this.validate(value))
      throw new BadRequestException(
        'Address should start with 0x and be 42 characters long',
      );
    return value;
  }

  private validate(value: string): boolean {
    return isAddress(value);
  }
}
