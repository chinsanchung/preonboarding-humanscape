import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClinicalModule } from './clinical/clinical.module';
import { StepModule } from './step/step.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'humanscape.db',
      entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ClinicalModule,
    StepModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
