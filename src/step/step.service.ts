import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStepDto } from './dto/create-step.dto';
import { Step } from './entities/step.entity';

@Injectable()
export class StepService {
  constructor(
    @InjectRepository(Step)
    private readonly stepRepository: Repository<Step>,
  ) {}

  async createStep(createStepDto: CreateStepDto): Promise<Step> {
    try {
      return await this.stepRepository.save(
        this.stepRepository.create({ ...createStepDto }),
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOneByName(name: string): Promise<Step> {
    return await this.stepRepository.findOne({ name });
  }
}
