import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinical } from './entities/clinical.entity';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(Clinical)
    private readonly clinicalRepository: Repository<Clinical>,
  ) {}
}
