import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalController } from './clinical.controller';
import { ClinicalService } from './clinical.service';
import { Clinical } from './entities/clinical.entity';

jest.mock('./clinical.service');

describe('ClinicalController', () => {
  let controller: ClinicalController;
  let service: ClinicalService;
  const mockClinical: Clinical = {
    id: 1,
    GOODS_NAME: '상품 이름',
    APPLY_ENTP_NAME: '신청자',
    LAB_NAME: '실시 기관 이름',
    CLINIC_EXAM_TITLE: '임상 시험 제목',
    APPROVAL_TIME: new Date(),
    created_At: new Date(),
  };

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

  describe('find one', () => {
    it('findone - success', async () => {
      jest
        .spyOn(service, 'findOneClinical')
        .mockResolvedValueOnce(mockClinical);

      const result = await controller.findOneClinical('1');
      expect(result).toMatchObject(mockClinical);
    });
    it('find one - 해당 아이디를 가진 임상 정보가 없거나 유효한 임상 번호가 아님.', async () => {
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
});
