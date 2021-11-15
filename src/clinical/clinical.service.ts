import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalRepository } from './clinical.repository';
import { Clinical } from './entities/clinical.entity';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
  ) {}

  async findOneClinical(id: number): Promise<Clinical> {
    const result = await this.clinicalRepository.findOne(id);
    if (!result) {
      throw new NotFoundException('유효한 임상 번호가 아닙니다.');
    }
    return result;
  }
}
