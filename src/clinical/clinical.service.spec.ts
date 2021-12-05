import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Step } from '../step/entities/step.entity';
import { StepService } from '../step/step.service';
import { ClinicalRepository } from './clinical.repository';
import { ClinicalService } from './clinical.service';
import { Clinical } from './entities/clinical.entity';

const mockClinicalRepository = () => ({
  findOne: jest.fn(),
  getListClinical: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

const mockHttpService = () => ({
  get: jest.fn(),
});

jest.mock('../step/step.service');

describe('ClinicalService', () => {
  let service: ClinicalService;
  let repository: ClinicalRepository;
  let stepService: StepService;
  let httpService: HttpService;

  const mockClinical = new Clinical();
  mockClinical.id = 1;
  mockClinical.GOODS_NAME = '상품 이름';
  mockClinical.APPLY_ENTP_NAME = '신청자';
  mockClinical.LAB_NAME = '실시 기관 이름';
  mockClinical.CLINIC_EXAM_TITLE = '임상 시험 제목';
  mockClinical.APPROVAL_TIME = new Date('2021-11-16');
  mockClinical.created_At = new Date('2021-11-16');

  const mockStep = new Step();
  mockStep.id = 1;
  mockStep.name = '1상';
  mockStep.created_At = new Date('2021-11-16');

  mockClinical.step = mockStep;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalService,
        StepService,
        {
          provide: HttpService,
          useFactory: mockHttpService,
        },
        {
          provide: ClinicalRepository,
          useFactory: mockClinicalRepository,
        },
      ],
    }).compile();

    service = module.get<ClinicalService>(ClinicalService);
    repository = module.get<ClinicalRepository>(ClinicalRepository);
    stepService = module.get<StepService>(StepService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect.assertions(4);
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(stepService).toBeDefined();
    expect(httpService).toBeDefined();
  });

  describe('findOneClinical', () => {
    it('findOneClinical - success', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockClinical);
      const expectClinical = await service.findOneClinical(1);
      expect(expectClinical).toMatchObject(mockClinical);
    });
    it('findOneClinical - 해당 아이디와 일치하는 값이 없음.', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      try {
        await service.findOneClinical(3);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('유효한 임상 번호가 아닙니다.');
      }
    });
  });

  describe('getListClinical', () => {
    it('getListClinical - success', async () => {
      expect.assertions(2);
      jest
        .spyOn(repository, 'getListClinical')
        .mockResolvedValue({ count: 1, data: [mockClinical] });

      const query = {
        page: '1',
        GOODS_NAME: '이름',
        APPROVAL_TIME: '2021-11-16',
        step: '1상',
      };
      const expectClinicalList = await service.getListClinical(query);
      expect(expectClinicalList.count).toBe(1);
      expect(expectClinicalList.data).toStrictEqual([mockClinical]);
    });
    it('getListClinical - 검색 결과 없음', async () => {
      jest
        .spyOn(repository, 'getListClinical')
        .mockResolvedValue({ count: 0, data: [] });

      const expectClinicalList = await service.getListClinical({
        page: '1',
        APPROVAL_TIME: '2000-01-01',
      });
      expect(expectClinicalList.count).toBe(0);
      expect(expectClinicalList.data).toStrictEqual([]);
    });
  });

  describe('createClinical', () => {
    it('clinical 생성에 성공한다', async () => {
      expect.assertions(7);
      const stepId = 1;
      const stepName = '1상';

      const step = new Step();
      step.id = stepId;
      step.name = stepName;
      jest.spyOn(service, 'getStep').mockResolvedValue(step);

      const clinical = new Clinical();
      clinical.id = 1;
      clinical.APPLY_ENTP_NAME = '고신대학교복음병원';
      clinical.APPROVAL_TIME = new Date('2021-10-29 04:47:34');
      clinical.LAB_NAME = '고산대학교복음병원';
      clinical.GOODS_NAME = '세보레인흡입액(세보플루란)';
      clinical.CLINIC_EXAM_TITLE =
        '전신 마취 환자에서 세보플루란 단독 사용과 세보플루란 사용 후 단기간 데스플루란 사용 시 각성 시간 비교';
      clinical.step = step;
      jest.spyOn(repository, 'save').mockResolvedValue(clinical);

      const expectClinical = await service.createClinical(clinical);
      expect(expectClinical.id).toEqual(clinical.id);
      expect(expectClinical.APPLY_ENTP_NAME).toEqual(clinical.APPLY_ENTP_NAME);
      expect(expectClinical.APPROVAL_TIME).toEqual(clinical.APPROVAL_TIME);
      expect(expectClinical.LAB_NAME).toEqual(clinical.LAB_NAME);
      expect(expectClinical.GOODS_NAME).toEqual(clinical.GOODS_NAME);
      expect(expectClinical.CLINIC_EXAM_TITLE).toEqual(
        clinical.CLINIC_EXAM_TITLE,
      );
      expect(expectClinical.step).toBe(clinical.step);
    });
  });

  describe('getStep', () => {
    it('step 조회에 성공하여 해당 step을 반환한다', async () => {
      expect.assertions(2);
      const clinicStepName = '1상';

      const step = new Step();
      step.id = 1;
      step.name = clinicStepName;
      jest.spyOn(stepService, 'findOneByName').mockResolvedValue(step);

      const expectStep = await service.getStep(clinicStepName);
      expect(expectStep.id).toEqual(step.id);
      expect(expectStep.name).toEqual(step.name);
    });

    it('step이 조회되지 않아 step을 생성하여 반환한다', async () => {
      expect.assertions(2);
      const clinicStepName = '1상';

      const newStep = new Step();
      newStep.id = 1;
      newStep.name = clinicStepName;
      jest.spyOn(stepService, 'findOneByName').mockResolvedValue(undefined);
      jest.spyOn(stepService, 'createStep').mockResolvedValue(newStep);

      const expectStep = await service.getStep(clinicStepName);
      expect(expectStep.id).toEqual(newStep.id);
      expect(expectStep.name).toEqual(newStep.name);
    });

    it(`CLINIC_STEP_NAME이 존재하지 않아 '기타'로 대체하여 step을 조회한다`, async () => {
      expect.assertions(2);
      const clinicStepName = '';

      const step = new Step();
      step.id = 1;
      step.name = '기타';
      jest.spyOn(stepService, 'findOneByName').mockResolvedValue(step);

      const expectStep = await service.getStep(clinicStepName);
      expect(expectStep.id).toEqual(step.id);
      expect(expectStep.name).toEqual(step.name);
    });
  });

  describe('batchData', () => {
    it('API 데이터가 DB 데이터 보다 많으면 데이터를 추가한다', async () => {
      jest.spyOn(service, 'getApiTotalCount').mockResolvedValue(11);
      jest.spyOn(repository, 'count').mockResolvedValue(10);

      const clinical1 = new Clinical();
      clinical1.id = 1;
      clinical1.APPLY_ENTP_NAME = '고신대학교복음병원';
      clinical1.APPROVAL_TIME = new Date('2021-10-29 04:47:34');
      clinical1.LAB_NAME = '고산대학교복음병원';
      clinical1.GOODS_NAME = '세보레인흡입액(세보플루란)';
      clinical1.CLINIC_EXAM_TITLE =
        '전신 마취 환자에서 세보플루란 단독 사용과 세보플루란 사용 후 단기간 데스플루란 사용 시 각성 시간 비교';

      const clinical2 = new Clinical();
      clinical2.id = 2;
      clinical2.APPLY_ENTP_NAME = '에이치엘비제약(주)';
      clinical2.APPROVAL_TIME = new Date('2021-10-29 05:03:04');
      clinical2.LAB_NAME = '부민병원:(주)바이오인프라';
      clinical2.GOODS_NAME = '글리메프정4밀리그램(글리메피리드)';
      clinical2.CLINIC_EXAM_TITLE =
        '에이치엘비제약㈜의 “글리메프정4밀리그램(글리메피리드)”(글리메피리드 4 mg)과 ㈜한독의 “아마릴정4밀리그람(글리메피리드)”(글리메피리드 4 mg)의 생물학적 동등성평가를 위한 건강한 성인 시험대상자에서의 공개, 무작위배정, 2군, 2기, 공복, 단회, 경구, 교차 시험';

      const clinicalArr = [clinical1, clinical2];
      jest.spyOn(service, 'getAPIData').mockResolvedValueOnce(clinicalArr);
      jest.spyOn(service, 'getAPIData').mockResolvedValueOnce(undefined);
      await service.batchData();
      expect(service.getAPIData).toBeCalledTimes(2);
    });
  });
});
