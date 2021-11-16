import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_At: Date;
}
