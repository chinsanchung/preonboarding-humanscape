import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as xml2json from 'xml2json';
import * as moment from 'moment-timezone';

import { ClinicalRepository } from './clinical.repository';
import { StepService } from '../step/step.service';
import { Clinical } from './entities/clinical.entity';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
    private httpService: HttpService,
    private stepService: StepService,
  ) {}

  async getAPIData(numOfRows, pageNo) {
    let url =
      'http://apis.data.go.kr/1470000/MdcinClincTestInfoService/getMdcinClincTestInfoList';
    url += '?' + `ServiceKey=${process.env.SERVICE_KEY}`;
    url += '&' + `numOfRows=${numOfRows}`;
    url += '&' + `pageNo=${pageNo}`;

    const data = this.httpService
      .get(url)
      .toPromise()
      .then(async (axiosResponse) => {
        const jsonResponse = JSON.parse(xml2json.toJson(axiosResponse.data));
        const items = jsonResponse.response.body.items.item; // 임상 실험 데이터 배열

        if (!items) {
          return;
        }

        // DB에 insert
        for (let i = 0; i < items.length; i++) {
          await this.createClinical(items[i]);
        }

        return items;
      });
    return data;
  }

  async createClinical(clinical) {
    //KST to UTC
    const KSTApprovalTime = new Date(clinical.APPROVAL_TIME).getTime();
    const modifiedApprovalTime = moment(KSTApprovalTime).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    clinical.APPROVAL_TIME = modifiedApprovalTime;

    if (Object.keys(clinical.CLINIC_STEP_NAME).length === 0) {
      clinical.CLINIC_STEP_NAME = '기타';
    }

    let step = await this.stepService.findOneByName(clinical.CLINIC_STEP_NAME);
    if (!step) {
      step = await this.stepService.createStep({
        name: clinical.CLINIC_STEP_NAME,
      });
    }
    return await this.clinicalRepository.save({ ...clinical, step });
  }

  // 초기 데이터 입력
  async enterInitialData() {
    let pageNo = 1;
    const numOfRows = 100;

    console.log('[ClinicalService enterInitialData] start');
    // API에서 페이지별 데이터를 가져옴
    let data = await this.getAPIData(numOfRows, pageNo);
    // API에서 빈 페이지를 가져오면 while 종료
    while (data) {
      pageNo++;
      data = await this.getAPIData(numOfRows, pageNo);
    }
    console.log('[ClinicalService enterInitialData] end');
  }

  async findOneClinical(id: number): Promise<Clinical> {
    const result = await this.clinicalRepository.findOne(id);
    if (!result) {
      throw new NotFoundException('유효한 임상 번호가 아닙니다.');
    }
    return result;
  }
}
