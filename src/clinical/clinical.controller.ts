import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { QueryDto } from './dto/Query.dto';
import { Clinical } from './entities/clinical.entity';

@Controller('clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Get()
  getListClinical(
    @Query() query: QueryDto,
  ): Promise<{ data: Clinical[]; count: number }> {
    return this.clinicalService.getListClinical(query);
  }
  @Get(':id')
  async findOneClinical(@Param('id') id: string): Promise<Clinical> {
    return this.clinicalService.findOneClinical(Number(id));
  }

  @Post()
  async createAllDataForInitialSetting(): Promise<string> {
    const result = await this.clinicalService.createAllDataForInitialSetting();
    return result
      ? '초기 데이터 저장에 성공했습니다.'
      : '초기 데이터 저장에 실패했습니다.';
  }
}
