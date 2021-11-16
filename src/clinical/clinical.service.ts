import { Injectable } from '@nestjs/common';
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
}
