import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStepDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
