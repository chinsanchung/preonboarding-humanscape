import { Body, Controller, Post } from '@nestjs/common';
import { CreateStepDto } from './dto/create-step.dto';
import { Step } from './entities/step.entity';
import { StepService } from './step.service';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  createStep(@Body() createStepDto: CreateStepDto): Promise<Step> {
    return this.stepService.createStep(createStepDto);
  }
}
