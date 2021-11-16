import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalRepository } from './clinical.repository';
import * as xml2json from 'xml2json';
import * as moment from 'moment-timezone';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
    private httpService: HttpService,
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
    const KSTApprovalTime = new Date(clinical.APPROVAL_TIME).getTime();
    const modifiedApprovalTime = moment(KSTApprovalTime).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    clinical.APPROVAL_TIME = modifiedApprovalTime;
    return await this.clinicalRepository.save({ ...clinical });
  }

  // 초기 데이터 입력
  async enterInitialData() {
    let pageNo = 94;
    const numOfRows = 100;

    // API에서 페이지별 데이터를 가져옴
    let data = await this.getAPIData(numOfRows, pageNo);
    console.log(data);
    // API에서 빈 페이지를 가져오면 while 종료
    while (data) {
      pageNo++;
      data = await this.getAPIData(numOfRows, pageNo);
    }
  }
}
