import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { map } from 'rxjs';
import { ClinicalRepository } from './clinical.repository';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
    private httpService: HttpService,
  ) {}

  getAPIData() {
    const data = this.httpService
      .get(
        'http://apis.data.go.kr/1470000/MdcinClincTestInfoService/getMdcinClincTestInfoList?ServiceKey=FBhDUJi2DzmS99NRgs3XzNrHXy7butoKncp3C9Jv5nmhSs1jMk6nRMOthfpYNyskq2hwvcZxgiRZbMoBlGMIrg%3D%3D', //&numOfRows=3&pageNo=1',
      )
      .pipe(
        map((axiosResponse) => {
          console.log(axiosResponse.data);
          return axiosResponse.data;
        }),
      );
    return data;
  }
}
