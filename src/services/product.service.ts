import httpClient from './httpClient'
import type { Product, ProductFilters, ProductsResponse } from '@/src/types/product'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'
const PRODUCTS_BASE = `${API_BASE}/products`

// Backend envelope shapes
interface BackendProductsEnvelope {
  success: boolean
  data: {
    products?: Product[]
    pagination?: { total: number; page: number; limit: number; pages: number }
    // older shape
    total?: number
    page?: number
    pages?: number
  } | Product[]
}

interface BackendProductEnvelope {
  success: boolean
  data: { product: Product } | Product
}

function extractProducts(raw: BackendProductsEnvelope): ProductsResponse {
  const d = raw.data
  if (Array.isArray(d)) {
    return { products: d, total: d.length, page: 1, pages: 1 }
  }
  const pagination = (d as { pagination?: { total: number; page: number; pages: number } }).pagination
  return {
    products: (d as { products?: Product[] }).products ?? [],
    total: pagination?.total ?? (d as { total?: number }).total ?? 0,
    page:  pagination?.page  ?? (d as { page?: number }).page  ?? 1,
    pages: pagination?.pages ?? (d as { pages?: number }).pages ?? 1,
  }
}

function extractProduct(raw: BackendProductEnvelope): Product {
  const d = raw.data
  if ('product' in d && d.product) return d.product
  return d as unknown as Product
}

function buildParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.brand)        params.set('brand', filters.brand)
  if (filters.minPrice !== undefined)    params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== undefined)    params.set('maxPrice', String(filters.maxPrice))
  if (filters.minRating !== undefined)   params.set('minRating', String(filters.minRating))
  if (filters.minDiscount !== undefined) params.set('minDiscount', String(filters.minDiscount))
  if (filters.inStock !== undefined)     params.set('inStock', String(filters.inStock))
  if (filters.search)       params.set('search', filters.search)
  if (filters.sort)         params.set('sort', filters.sort)
  params.set('page', String(filters.page ?? 1))
  if (filters.limit) params.set('limit', String(filters.limit))
  return params
}

export const productService = {
  /** category is routed via the dedicated /products/category/:category endpoint; all other filters are query params on either endpoint. */
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = buildParams(filters)
    const url = filters.category
      ? `${PRODUCTS_BASE}/category/${encodeURIComponent(filters.category)}?${params}`
      : `${PRODUCTS_BASE}?${params}`
    const { data } = await httpClient.get<BackendProductsEnvelope>(url)
    return extractProducts(data)
  },

  async searchProducts(query: string, page = 1): Promise<ProductsResponse> {
    return productService.getProducts({ search: query, page })
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await httpClient.get<BackendProductEnvelope>(`${PRODUCTS_BASE}/${id}`)
    return extractProduct(data)
  },

  async addProduct(formData: FormData): Promise<Product> {
    const { data } = await httpClient.post<BackendProductEnvelope>(PRODUCTS_BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return extractProduct(data)
  },

  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const { data } = await httpClient.put<BackendProductEnvelope>(
      `${PRODUCTS_BASE}/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return extractProduct(data)
  },

  async deleteProduct(id: string): Promise<void> {
    await httpClient.delete(`${PRODUCTS_BASE}/${id}`)
  },
}
