import { Controller, Get } from '@nestjs/common';
import { ClinicalService } from './clinical.service';

@Controller('clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  //테스트용도. 추후 삭제 할 것
  @Get()
  enterData() {
    const data = this.clinicalService.getAPIData();
    console.log(data);
    return data;
  }
  ///////////
}
