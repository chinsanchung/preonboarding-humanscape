import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as xml2json from 'xml2json-light';
import * as moment from 'moment-timezone';

import { ClinicalRepository } from './clinical.repository';
import { StepService } from '../step/step.service';
import { Clinical } from './entities/clinical.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
    private httpService: HttpService,
    private stepService: StepService,
  ) {}

  async getAPIData(numOfRows, pageNo, start = 0) {
    let url =
      'http://apis.data.go.kr/1470000/MdcinClincTestInfoService/getMdcinClincTestInfoList';
    url += '?' + `ServiceKey=${process.env.SERVICE_KEY}`;
    url += '&' + `numOfRows=${numOfRows}`;
    url += '&' + `pageNo=${pageNo}`;

    const data = this.httpService
      .get(url)
      .toPromise()
      .then(async (axiosResponse) => {
        const jsonResponse = xml2json.xml2json(axiosResponse.data);
        const items = jsonResponse.response.body.items.item; // 임상 실험 데이터 배열

        if (!items) {
          return;
        }

        // DB에 insert
        for (let i = start; i < items.length; i++) {
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

  // 매주 월~토요일 0시 0분 0초에 배치 작업 수행
  @Cron('0 0 0 * * 1-6')
  async batchData() {
    // api에서 데이터를 가져온다 totalCount를 읽는다
    const apiTotalCount = await this.getApiTotalCount();

    // db clinical 테이블 전체 데이터갯수를 가져온다
    const dbTotalCount = await this.clinicalRepository.count();

    // api에서 가져온 totalCount가 clinical 테이블 전체 데이터 갯수보다 많은 경우 현재 테이블 로우 에서 끝까지 db에 넣는다
    if (apiTotalCount > dbTotalCount) {
      const start = dbTotalCount % 100;
      let pageNo = Math.floor(dbTotalCount / 100) + 1;

      let data = await this.getAPIData(100, pageNo, start);
      // API에서 빈 페이지를 가져오면 while 종료
      while (data) {
        pageNo++;
        data = await this.getAPIData(100, pageNo);
      }
    }
  }

  getApiTotalCount() {
    let url =
      'http://apis.data.go.kr/1470000/MdcinClincTestInfoService/getMdcinClincTestInfoList';
    url += '?' + `ServiceKey=${process.env.SERVICE_KEY}`;
    url += '&' + `numOfRows=${1}`;
    url += '&' + `pageNo=${1}`;

    const data = this.httpService
      .get(url)
      .toPromise()
      .then(async (axiosResponse) => {
        const jsonResponse = xml2json.xml2json(axiosResponse.data);
        return jsonResponse.response.body.totalCount;
      });
    return data;
  }
}
