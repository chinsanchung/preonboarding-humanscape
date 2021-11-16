import { Controller, Get, Query } from '@nestjs/common';
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
}
