import { PartialType } from '@nestjs/mapped-types';

export class UpscaleDto {
  prompt: string;
  index: number;
  msgId: string;
  msgHash: string;
  userId?: string;
  translate?: string;
  flags?: number;
}

export class CreateApiDto {
  prompt: string;
  userId?: string;
}

export class UpdateApiDto extends PartialType(CreateApiDto) {}
