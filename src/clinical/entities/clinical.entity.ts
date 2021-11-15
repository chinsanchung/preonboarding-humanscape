import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Step } from '../../step/entities/step.entity';

@Entity()
export class Clinical extends CoreEntity {
  @Column()
  GOODS_NAME: string;

  @Column()
  APPLY_ENTP_NAME: string;

  @Column()
  LAB_NAME: string;

  @Column()
  CLINIC_EXAM_TITLE: string;

  @Column()
  APPROVAL_TIME: Date;

  @ManyToOne((_type) => Step, (step) => step.clinicals)
  step: Step;
}
