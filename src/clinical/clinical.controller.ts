import { Controller, Get, Param } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { Clinical } from './entities/clinical.entity';

@Controller('clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  //테스트용도. 추후 삭제 할 것
  @Get()
  async enterData() {
    const data = await this.clinicalService.enterInitialData();
    return data;
  }
  ///////////

  @Get(':id')
  async findOneClinical(@Param('id') id: string): Promise<Clinical> {
    return this.clinicalService.findOneClinical(Number(id));
  }
}
