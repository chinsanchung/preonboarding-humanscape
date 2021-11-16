import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import * as xml2json from 'xml2json-light';
import * as moment from 'moment-timezone';

import { ClinicalRepository } from './clinical.repository';
import { QueryDto } from './dto/Query.dto';
import { StepService } from '../step/step.service';
import { Clinical } from './entities/clinical.entity';
import { Step } from '../step/entities/step.entity';
import { CLINICAL_CONSTANT } from './clinical.constants';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
    private httpService: HttpService,
    private stepService: StepService,
  ) {}

  async getListClinical(
    query: QueryDto,
  ): Promise<{ data: Clinical[]; count: number }> {
    return await this.clinicalRepository.getListClinical(query);
  }

  async getAPIData(pageNo, start = 0): Promise<Clinical[]> {
    let url =
      'http://apis.data.go.kr/1470000/MdcinClincTestInfoService/getMdcinClincTestInfoList';
    url += '?' + `ServiceKey=${process.env.SERVICE_KEY}`;
    url += '&' + `numOfRows=${CLINICAL_CONSTANT.NUM_OF_ROWS}`;
    url += '&' + `pageNo=${pageNo}`;

    return this.httpService
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
  }

  async createClinical(clinical): Promise<Clinical> {
    clinical.APPROVAL_TIME = this.convertKstToUtc(clinical.APPROVAL_TIME);

    const step = await this.getStep(clinical.CLINIC_STEP_NAME);

    return await this.clinicalRepository.save({ ...clinical, step });
  }

  async getStep(clinicStepName): Promise<Step> {
    // api의 CLINIC_STEP_NAME 이 존재 하지않을 경우 '기타' 로 등록
    if (clinicStepName === '') {
      clinicStepName = '기타';
    }

    let step = await this.stepService.findOneByName(clinicStepName);
    if (!step) {
      step = await this.stepService.createStep({
        name: clinicStepName,
      });
    }

    return step;
  }

  //KST to UTC
  convertKstToUtc(time): string {
    const KSTApprovalTime = new Date(time).getTime();
    const modifiedApprovalTime = moment(KSTApprovalTime).format(
      'YYYY-MM-DD HH:mm:ss',
    );

    return modifiedApprovalTime;
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
  async batchData(): Promise<void> {
    // api에서 데이터를 가져온다 totalCount를 읽는다
    const apiTotalCount = await this.getApiTotalCount();
    // db clinical 테이블 전체 데이터갯수를 가져온다
    const dbTotalCount = await this.clinicalRepository.count();

    // api에서 가져온 totalCount가 clinical 테이블 전체 데이터 갯수보다 많은 경우 현재 테이블 로우 에서 끝까지 db에 넣는다
    if (apiTotalCount > dbTotalCount) {
      const start = dbTotalCount % CLINICAL_CONSTANT.NUM_OF_ROWS;
      let pageNo = Math.floor(dbTotalCount / CLINICAL_CONSTANT.NUM_OF_ROWS) + 1;

      let data = await this.getAPIData(pageNo, start);
      // API에서 빈 페이지를 가져오면 while 종료
      while (data) {
        pageNo++;
        data = await this.getAPIData(pageNo);
      }
    }
  }

  getApiTotalCount(): Promise<number> {
    let url =
      'http://apis.data.go.kr/1470000/MdcinClincTestInfoService/getMdcinClincTestInfoList';
    url += '?' + `ServiceKey=${process.env.SERVICE_KEY}`;
    url += '&' + `numOfRows=${1}`;
    url += '&' + `pageNo=${1}`;

    return this.httpService
      .get(url)
      .toPromise()
      .then(async (axiosResponse) => {
        const jsonResponse = xml2json.xml2json(axiosResponse.data);
        return jsonResponse.response.body.totalCount;
      });
  }
}
