import { useEntityCrud } from '../../../hooks/useEntityCrud'
import {
    type Product,
    type CreateProductDto,
} from './productosApi'

const crudOperations = {
    load: async (...args: any[]) => [],
    create: async () => ({} as any),
    update: async () => ({} as any),
    delete: async () => { },
}

export function useProductoCrud() {
    const crud = useEntityCrud<Product, CreateProductDto, Partial<CreateProductDto>>(crudOperations)

    return {
        ...crud,
        getDeleted: async () => [],
        restore: async () => true,
    }
}
