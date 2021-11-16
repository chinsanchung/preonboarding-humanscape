import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Clinical } from '../../clinical/entities/clinical.entity';

@Entity()
export class Step extends CoreEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany((_type) => Clinical, (clinical) => clinical.step)
  clinicals: Clinical[];
}
