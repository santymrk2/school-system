
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;

  first: boolean;
  last: boolean;
  numberOfElements?: number;
  empty?: boolean;
  sort?: unknown;
  pageable?: unknown;
}

