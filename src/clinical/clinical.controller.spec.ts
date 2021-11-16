import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Step } from '../step/entities/step.entity';
import { ClinicalController } from './clinical.controller';
import { ClinicalService } from './clinical.service';
import { Clinical } from './entities/clinical.entity';

jest.mock('./clinical.service');

describe('ClinicalController', () => {
  let controller: ClinicalController;
  let service: ClinicalService;

  const mockClinical = new Clinical();
  mockClinical.id = 1;
  mockClinical.GOODS_NAME = '상품 이름';
  mockClinical.APPLY_ENTP_NAME = '신청자';
  mockClinical.LAB_NAME = '실시 기관 이름';
  mockClinical.CLINIC_EXAM_TITLE = '임상 시험 제목';
  mockClinical.APPROVAL_TIME = new Date();
  mockClinical.created_At = new Date();

  const mockStep = new Step();
  mockStep.id = 1;
  mockStep.name = '1상';
  mockStep.created_At = new Date('2021-11-16');

  mockClinical.step = mockStep;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicalController],
      providers: [ClinicalService],
    }).compile();

    controller = module.get<ClinicalController>(ClinicalController);
    service = module.get<ClinicalService>(ClinicalService);
  });

  it('should bee defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findOneClinical', () => {
    it('findOneClinical - success', async () => {
      jest.spyOn(service, 'findOneClinical').mockResolvedValue(mockClinical);

      const result = await controller.findOneClinical('1');
      expect(result).toMatchObject(mockClinical);
    });
    it('findOneClinical - 해당 아이디를 가진 임상 정보가 없거나 유효한 임상 번호가 아님.', async () => {
      jest.spyOn(service, 'findOneClinical').mockImplementation(() => {
        throw new NotFoundException('유효한 임상 번호가 아닙니다.');
      });

      try {
        await controller.findOneClinical('123');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('유효한 임상 번호가 아닙니다.');
      }
    });
  });

  describe('getListClinical', () => {
    it('getListClinical - success', async () => {
      const query = {
        page: '1',
        GOODS_NAME: '이름',
        APPROVAL_TIME: '2021-11-16',
        step: '1상',
      };
      jest
        .spyOn(service, 'getListClinical')
        .mockResolvedValue({ count: 1, data: [mockClinical] });
      const expectClinicalList = await controller.getListClinical(query);
      expect(expectClinicalList.count).toBe(1);
      expect(expectClinicalList.data).toStrictEqual([mockClinical]);
    });
    it('getListClinical - 검색 결과 없음', async () => {
      expect.assertions(2);
      jest
        .spyOn(service, 'getListClinical')
        .mockResolvedValue({ count: 0, data: [] });
      const expectClinicalList = await controller.getListClinical({
        page: '1',
        APPROVAL_TIME: '2000-01-01',
      });
      expect(expectClinicalList.count).toBe(0);
      expect(expectClinicalList.data).toStrictEqual([]);
    });
  });
});
