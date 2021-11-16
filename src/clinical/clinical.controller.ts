import { Controller, Get, Param } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { Clinical } from './entities/clinical.entity';

@Controller('clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Get(':id')
  async findOneClinical(@Param('id') id: string): Promise<Clinical> {
    return this.clinicalService.findOneClinical(Number(id));
  }
}
