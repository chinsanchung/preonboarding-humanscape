import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalRepository } from './clinical.repository';
import { QueryDto } from './dto/Query.dto';
import { Clinical } from './entities/clinical.entity';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(ClinicalRepository)
    private readonly clinicalRepository: ClinicalRepository,
  ) {}

  async getListClinical(
    query: QueryDto,
  ): Promise<{ data: Clinical[]; count: number }> {
    return await this.clinicalRepository.getListClinical(query);
  }

  async findOneClinical(id: number): Promise<Clinical> {
    const result = await this.clinicalRepository.findOne(id);
    if (!result) {
      throw new NotFoundException('유효한 임상 번호가 아닙니다.');
    }
    return result;
  }
}
