import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Step extends CoreEntity {
  @Column()
  name: string;
}
