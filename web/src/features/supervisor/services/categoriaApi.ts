import { useEntityCrud } from '../../../hooks/useEntityCrud'
import {
  type Category,
  type CreateCategoryDto,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDeletedCategories,
  restoreCategory
} from './catalogApi'

const crudOperations = {
  load: getAllCategories,
  create: createCategory,
  update: (id: string | number, data: Partial<CreateCategoryDto>) => updateCategory(id.toString(), data),
  delete: (id: string | number) => deleteCategory(id.toString()),
}

export function useCategoriaCrud() {
  const crud = useEntityCrud<Category, CreateCategoryDto, Partial<CreateCategoryDto>>(crudOperations)

  return {
    ...crud,
    getDeleted: getDeletedCategories,
    restore: restoreCategory,
  }
}
