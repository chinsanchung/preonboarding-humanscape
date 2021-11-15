import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { map, Observable } from 'rxjs';
import { ClinicalRepository } from './clinical.repository';
import * as xml2json from 'xml2json';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
    private httpService: HttpService,
  ) {}

  getAPIData(numOfRows, pageNo) {
    const data = this.httpService
      .get(
        `http://apis.data.go.kr/1470000/MdcinClincTestInfoService/getMdcinClincTestInfoList?ServiceKey=FBhDUJi2DzmS99NRgs3XzNrHXy7butoKncp3C9Jv5nmhSs1jMk6nRMOthfpYNyskq2hwvcZxgiRZbMoBlGMIrg==&numOfRows=${numOfRows}&pageNo=${pageNo}`,
      )
      .pipe(
        map(async (axiosResponse) => {
          const temp = JSON.parse(xml2json.toJson(axiosResponse.data));
          const items = temp.response.body.items.item;
          if (!items) {
            return axiosResponse.data;
          }
          for (let i = 0; i < items.length; i++) {
            await this.createClinical(items[i]);
          }
          return axiosResponse.data;
        }),
      );
    return data;
  }

  async createClinical(clinical) {
    return await this.clinicalRepository.save({ ...clinical });
  }
}
