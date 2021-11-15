import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalController } from './clinical.controller';
import { ClinicalRepository } from './clinical.repository';
import { ClinicalService } from './clinical.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalRepository])],
  controllers: [ClinicalController],
  providers: [ClinicalService],
})
export class ClinicalModule {}
