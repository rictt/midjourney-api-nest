import { Page } from 'src/interfaces/page';

// export class UpdateMessageDto extends PartialType(CreateMessageDto) {}
export class QueryMessageDto extends Page {
  username?: string;
}
