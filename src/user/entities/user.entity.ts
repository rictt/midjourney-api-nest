import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum UserStatus {
  INIT = 10,
  NORMAL = 11,
  DISABLED = 12,
}

@Entity()
export class User {
  // https://www.saoniuhuo.com/question/detail-1991927.html
  // 开发的时候每次更新代码，都会把数据库的uuid清空，暂时用回increment自增
  // @PrimaryGeneratedColumn('uuid') id: string;
  @PrimaryGeneratedColumn('increment') id: number;

  @Column({ nullable: false, length: 50 }) username: string;

  @Column({ nullable: false, length: 1000 }) password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INIT })
  status: number;

  // 可以消费的绘画次数（不包含upscale）
  @Column({ type: 'int', default: 10 }) times: number;

  @Column() createTime: Date;
}
