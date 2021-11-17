import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
} from '@nestjs/common';
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
  @Get('batch')
  async batchData(@Query('BATCH_KEY') BATCH_KEY: string) {
    if (process.env.BATCH_KEY != BATCH_KEY) {
      throw new ForbiddenException();
    }
    return this.clinicalService.batchData();
  }
  @Get(':id')
  async findOneClinical(@Param('id') id: string): Promise<Clinical> {
    return this.clinicalService.findOneClinical(Number(id));
  }
}
