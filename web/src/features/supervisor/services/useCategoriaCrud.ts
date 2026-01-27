import { useEntityCrud } from '../../../hooks/useEntityCrud'
import {
  type Category,
  type CreateCategoryDto
} from './catalogApi'

const crudOperations = {
  load: async (...args: any[]) => [],
  create: async () => ({} as any),
  update: async () => ({} as any),
  delete: async () => { },
}

export function useCategoriaCrud() {
  const crud = useEntityCrud<Category, CreateCategoryDto, CreateCategoryDto>(crudOperations)

  return {
    ...crud,
    getDeleted: async () => [],
    restore: async (id: number) => true
  }
}
