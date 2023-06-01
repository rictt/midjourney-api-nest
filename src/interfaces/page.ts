export interface IPage {
  pageNum: number;
  pageSize?: number;
  total?: number;
}

export class Page {
  pageNum: number;
  pageSize?: number;
  total?: number;
}
