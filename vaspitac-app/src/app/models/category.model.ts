import { CategoryKey } from './category-keys';

export interface Category {
  id: CategoryKey;
  title: string;
  description: string;
  color: string;
  icon: string;
}
