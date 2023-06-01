import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum MessageStatus {
  INIT = 10,
  START = 11,
  DONE = 12,
  TIMEOUT = 13,
  FAILED = 14,
  SENSITIVE = 15,
}
@Entity()
export class Messages {
  @PrimaryGeneratedColumn() id: number;

  // 咒语
  @Column({ nullable: false, length: 2000 }) prompt: string;

  // 对应的英语翻译
  @Column({ nullable: true, length: 2000 }) translate: string;

  @Column({ nullable: true }) flags: number;

  // 图片地址
  @Column({ nullable: true }) uri: string;

  /**
   * 消息状态
   * - 10 还没开始，刚创建，等待发送给mj
   * - 11 进行中，当收到回调的第一条时修改状态
   * - 12 绘制完成，回调结束
   * - 13 超时任务，太久没回调或者定时任务超过x小时
   */
  @Column({ default: 10, type: 'int' }) status: number;
  // @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.INIT })
  // @Column({
  //   type: 'enum',
  //   enum: MessageStatus,
  //   default: MessageStatus.INIT,
  // })
  // status: MessageStatus;

  // 升级的索引值
  @Column({ nullable: true }) index: number;

  // 消息哈希
  @Column({ nullable: true }) msgHash: string;

  // 消息id
  @Column({ nullable: true }) msgId: string;

  @Column() createTime: Date;

  @Column() updateTime: Date;

  @Column({ nullable: true, length: 1000 }) remark: string;

  @Column({ nullable: true }) creator: string;
}
