import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StepModule } from 'src/step/step.module';
import { ClinicalController } from './clinical.controller';
import { ClinicalRepository } from './clinical.repository';
import { ClinicalService } from './clinical.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalRepository]),
    HttpModule,
    StepModule,
  ],
  controllers: [ClinicalController],
  providers: [ClinicalService],
})
export class ClinicalModule {}
