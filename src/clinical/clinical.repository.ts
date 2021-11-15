import { EntityRepository, Repository } from 'typeorm';
import { Clinical } from './entities/clinical.entity';

@EntityRepository(Clinical)
export class ClinicalRepository extends Repository<Clinical> {}
