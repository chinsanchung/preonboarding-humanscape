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
});

jest.mock('../step/step.service');

describe('ClinicalService', () => {
  let service: ClinicalService;
  let repository: ClinicalRepository;
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
        { provide: HttpService, useValue: { get: jest.fn(() => []) } },
        StepService,
        {
          provide: ClinicalRepository,
          useFactory: mockClinicalRepository,
        },
      ],
    }).compile();
    service = module.get<ClinicalService>(ClinicalService);
    repository = module.get<ClinicalRepository>(ClinicalRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
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
});
