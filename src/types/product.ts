// Backend returns images as objects; older data may be plain strings
export interface ProductImage {
  url: string
  publicId: string
  _id: string
}

export interface Specification {
  key: string
  value: string
}

export interface WeightSpec {
  value: number
  unit: 'g' | 'kg' | 'lb' | 'oz'
}

export interface DimensionsSpec {
  length: number
  width: number
  height: number
  unit: 'cm' | 'mm' | 'in'
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: 'Wireless' | 'Gaming' | 'Wired' | 'Other'
  stock: number
  images: (ProductImage | string)[]
  brand?: string
  sku?: string
  discount?: number
  tags?: string[]
  keyFeatures?: string[]
  specifications?: Specification[]
  weight?: WeightSpec
  dimensions?: DimensionsSpec
  isActive?: boolean
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pages: number
}

export const PRODUCT_CATEGORIES = ['Wireless', 'Gaming', 'Wired', 'Professional', 'Premium'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const WEIGHT_UNITS = ['g', 'kg', 'lb', 'oz'] as const
export type WeightUnit = (typeof WEIGHT_UNITS)[number]

export const DIMENSION_UNITS = ['cm', 'mm', 'in'] as const
export type DimensionUnit = (typeof DIMENSION_UNITS)[number]

/** Extract URL from either image format the backend may return */
export function getImageUrl(image: ProductImage | string): string {
  return typeof image === 'string' ? image : image.url
}
