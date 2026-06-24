import { z } from 'zod'
import { PRODUCT_CATEGORIES } from '@/src/types/product'

export interface AddProductMessages {
  error_name_required: string
  error_name_min: string
  error_name_max: string
  error_description_required: string
  error_description_min: string
  error_description_max: string
  error_price_required: string
  error_price_positive: string
  error_category_required: string
  error_stock_required: string
  error_stock_min: string
}

export const createAddProductSchema = (m: AddProductMessages) =>
  z.object({
    // ── Required ───────────────────────────────────────────────────────────────
    name: z.string().trim().min(1, m.error_name_required).min(2, m.error_name_min).max(100, m.error_name_max),
    description: z.string().trim().min(1, m.error_description_required).min(10, m.error_description_min).max(5000, m.error_description_max),
    price: z.string().min(1, m.error_price_required).refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, m.error_price_positive),
    category: z.enum(PRODUCT_CATEGORIES, { error: m.error_category_required }),
    stock: z.string().min(1, m.error_stock_required).refine((v) => !isNaN(parseInt(v)) && parseInt(v) >= 0, m.error_stock_min),

    // ── Optional basics ────────────────────────────────────────────────────────
    brand: z.string().trim().max(80).optional().or(z.literal('')),
    sku: z.string().trim().max(80).optional().or(z.literal('')),
    discount: z
      .string()
      .optional()
      .refine((v) => !v || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v) <= 100), 'Discount must be 0–100')
      .or(z.literal('')),

    // ── Arrays stored as user-friendly strings ─────────────────────────────────
    // tags: comma-separated → ["wireless","bluetooth"]
    tags: z.string().trim().optional().or(z.literal('')),
    // keyFeatures: one per line → ["40hr battery","ANC"]
    keyFeatures: z.string().trim().optional().or(z.literal('')),

    // ── Structured fields ──────────────────────────────────────────────────────
    specifications: z.array(z.object({ key: z.string().trim(), value: z.string().trim() })).optional(),

    weightValue: z.string().optional().or(z.literal('')),
    weightUnit: z.enum(['g', 'kg', 'lb', 'oz']).optional(),

    dimensionsLength: z.string().optional().or(z.literal('')),
    dimensionsWidth: z.string().optional().or(z.literal('')),
    dimensionsHeight: z.string().optional().or(z.literal('')),
    dimensionsUnit: z.enum(['cm', 'mm', 'in']).optional(),
  })

export type AddProductFormValues = z.input<ReturnType<typeof createAddProductSchema>>

/** Serialize form values into a FormData ready for multipart upload */
export function buildProductFormData(values: AddProductFormValues, images: File[]): FormData {
  const fd = new FormData()

  fd.append('name', values.name)
  fd.append('description', values.description)
  fd.append('price', values.price)
  fd.append('category', values.category)
  fd.append('stock', values.stock)

  if (values.brand)    fd.append('brand', values.brand)
  if (values.sku)      fd.append('sku', values.sku)
  if (values.discount) fd.append('discount', values.discount)

  const tags = (values.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean)
  if (tags.length) fd.append('tags', JSON.stringify(tags))

  const features = (values.keyFeatures ?? '').split('\n').map((f) => f.trim()).filter(Boolean)
  if (features.length) fd.append('keyFeatures', JSON.stringify(features))

  const specs = (values.specifications ?? []).filter((s) => s.key && s.value)
  if (specs.length) fd.append('specifications', JSON.stringify(specs))

  if (values.weightValue && values.weightUnit) {
    fd.append('weight', JSON.stringify({ value: parseFloat(values.weightValue), unit: values.weightUnit }))
  }

  const { dimensionsLength: l, dimensionsWidth: w, dimensionsHeight: h, dimensionsUnit: u } = values
  if (l && w && h && u) {
    fd.append('dimensions', JSON.stringify({ length: parseFloat(l), width: parseFloat(w), height: parseFloat(h), unit: u }))
  }

  images.forEach((img) => fd.append('images', img, img.name))

  return fd
}
