import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity } from 'typeorm';

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
}
