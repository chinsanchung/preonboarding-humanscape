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
    const { name } = createStepDto;
    const foundStep = await this.stepRepository.findOne({ name });
    if (foundStep) {
      throw new ConflictException('이미 존재하는 값입니다.');
    }

    try {
      const step = this.stepRepository.create({ name });
      return await this.stepRepository.save(step);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
