import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'processed' | 'failed';

  @Column({ name: 'retry_count', type: 'smallint', default: 0 })
  retryCount: number;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
