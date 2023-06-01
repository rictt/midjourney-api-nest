export class CreateMessageDto {
  prompt: string;
  msgHash?: string;
  msgId?: string;
  index?: number;
  uri?: string;
  status?: number;
  createTime?: Date;
  updateTime?: Date;
  remark?: string;
  userId?: string;
  creator?: string;
  username?: string;
  translate?: string;
}
