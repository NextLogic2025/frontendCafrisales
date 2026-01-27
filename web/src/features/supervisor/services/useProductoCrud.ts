import { useEntityCrud } from '../../../hooks/useEntityCrud'
import {
    type Product,
    type CreateProductDto,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getDeletedProducts,
    restoreProduct
} from './productosApi'

const crudOperations = {
    load: getAllProducts,
    create: createProduct,
    update: (id: string | number, data: Partial<CreateProductDto>) => updateProduct(id, data),
    delete: (id: string | number) => deleteProduct(id),
}

export function useProductoCrud() {
    const crud = useEntityCrud<Product, CreateProductDto, Partial<CreateProductDto>>(crudOperations)

    return {
        ...crud,
        getDeleted: getDeletedProducts,
        restore: restoreProduct,
    }
}
