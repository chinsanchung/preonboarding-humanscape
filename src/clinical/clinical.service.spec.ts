import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalRepository } from './clinical.repository';
import { ClinicalService } from './clinical.service';
import { Clinical } from './entities/clinical.entity';

const mockClinicalRepository = () => ({
  findOne: jest.fn(),
});

describe('ClinicalService', () => {
  let service: ClinicalService;
  let repository: ClinicalRepository;
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
      providers: [
        ClinicalService,
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

  describe('find one', () => {
    it('find one - success', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockClinical);
      const expectClinical = await service.findOneClinical(1);
      expect(expectClinical).toMatchObject(mockClinical);
    });
    it('find one - 해당 아이디와 일치하는 값이 없음.', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(undefined);
      try {
        await service.findOneClinical(3);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('유효한 임상 번호가 아닙니다.');
      }
    });
  });
});
