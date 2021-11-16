import { IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  GOODS_NAME?: string;

  @IsString()
  @IsOptional()
  APPROVAL_TIME?: string;

  @IsString()
  @IsOptional()
  LAB_NAME?: string;

  @IsString()
  @IsOptional()
  APPLY_ENTP_NAME?: string;

  @IsString()
  @IsOptional()
  CLINIC_EXAM_TITLE?: string;

  @IsString()
  @IsOptional()
  step?: string;
}
