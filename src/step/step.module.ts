import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StepService } from './step.service';
import { StepController } from './step.controller';
import { Step } from './entities/step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Step])],
  controllers: [StepController],
  providers: [StepService],
  exports: [StepService],
})
export class StepModule {}
