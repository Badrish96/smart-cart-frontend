'use client'

import { useCallback, useEffect, useState } from 'react'
import NextImage from 'next/image'
import { Trash2, Headphones, PlusCircle, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import {
  fetchProductsThunk,
  selectProducts,
  selectProductsLoading,
  deleteProductThunk,
  selectDeletingId,
} from '@/src/store/slices/productSlice'
import { getImageUrl } from '@/src/types/product'
import type { Product } from '@/src/types/product'
import { ROUTES } from '@/src/routes'
import Button from '@/src/components/ui/Button'
import Modal from '@/src/components/ui/Modal'
import EditProductForm from './EditProductForm'

interface Props {
  lang: string
}

const EDIT_MESSAGES = {
  error_name_required: 'Product name is required',
  error_name_min: 'Name must be at least 2 characters',
  error_name_max: 'Name must not exceed 100 characters',
  error_description_required: 'Description is required',
  error_description_min: 'Description must be at least 10 characters',
  error_description_max: 'Description must not exceed 5000 characters',
  error_price_required: 'Price is required',
  error_price_positive: 'Price must be greater than 0',
  error_category_required: 'Please select a category',
  error_stock_required: 'Stock quantity is required',
  error_stock_min: 'Stock cannot be negative',
  category_placeholder: 'Select a category',
  categories: { wireless: 'Wireless', gaming: 'Gaming', wired: 'Wired', other: 'Other' },
}

export default function AdminProductsClient({ lang }: Props) {
  const dispatch    = useAppDispatch()
  const products    = useAppSelector(selectProducts)
  const isLoading   = useAppSelector(selectProductsLoading)
  const deletingId  = useAppSelector(selectDeletingId)

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    dispatch(fetchProductsThunk({}))
  }, [dispatch])

  const handleDelete     = (id: string) => dispatch(deleteProductThunk(id))
  // Called by EditProductForm's onSubmit after a successful update — not inside an effect
  const handleEditClose  = useCallback(() => setEditingProduct(null), [])

  return (
    <div className="admin-content">
      <div className="admin-content-header">
        <div>
          <h1 className="text-h3 text-primary">All Products</h1>
          <p className="text-body-sm text-secondary mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} in your store
          </p>
        </div>
        <Link href={ROUTES.adminAddProduct(lang)} className="link-plain">
          <Button variant="primary" size="sm" icon={<PlusCircle size={16} />}>
            Add Product
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="admin-table-wrap">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="admin-table-skeleton" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <Headphones size={56} className="text-muted" />
          <p className="text-h4 text-primary">No products yet</p>
          <Link href={ROUTES.adminAddProduct(lang)} className="btn btn-primary mt-4 link-plain">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const img  = product.images?.[0] ? getImageUrl(product.images[0]) : null
                const date = product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString('en-IN')
                  : '—'
                const isBeingDeleted = deletingId === product._id

                return (
                  <tr key={product._id}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-thumb">
                          {img ? (
                            <NextImage
                              src={img}
                              alt={product.name}
                              width={44}
                              height={44}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          ) : (
                            <Headphones size={20} className="text-muted" />
                          )}
                        </div>
                        <span className="admin-product-name">{product.name}</span>
                      </div>
                    </td>
                    <td><span className="admin-category-badge">{product.category}</span></td>
                    <td className="fw-semibold text-primary">₹{product.price.toFixed(2)}</td>
                    <td>
                      <span className={`admin-stock-badge${product.stock > 0 ? ' admin-stock-badge--in' : ' admin-stock-badge--out'}`}>
                        {product.stock > 0 ? product.stock : 'Out'}
                      </span>
                    </td>
                    <td className="text-secondary fs-sm">{date}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="admin-edit-btn"
                          aria-label="Edit product"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          aria-label="Delete product"
                          disabled={isBeingDeleted}
                          onClick={() => handleDelete(product._id)}
                        >
                          {isBeingDeleted
                            ? <Loader2 size={14} className="admin-spinner" />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!editingProduct}
        onClose={handleEditClose}
        title={editingProduct ? `Edit — ${editingProduct.name}` : ''}
        size="lg"
      >
        {editingProduct && (
          <EditProductForm
            product={editingProduct}
            messages={EDIT_MESSAGES}
            onSuccess={handleEditClose}
          />
        )}
      </Modal>
    </div>
  )
}
