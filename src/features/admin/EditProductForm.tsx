'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X, Plus, Trash2 } from 'lucide-react'
import Input from '@/src/components/ui/Input'
import Textarea from '@/src/components/ui/Textarea'
import Dropdown from '@/src/components/ui/Dropdown'
import Button from '@/src/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { updateProductThunk, selectProductUpdating } from '@/src/store/slices/productSlice'
import { createAddProductSchema, buildProductFormData } from './schemas/addProductSchema'
import type { AddProductFormValues } from './schemas/addProductSchema'
import { PRODUCT_CATEGORIES, WEIGHT_UNITS, DIMENSION_UNITS, getImageUrl } from '@/src/types/product'
import type { Product } from '@/src/types/product'

interface EditMessages {
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
  category_placeholder: string
  categories: Record<string, string>
}

interface Props {
  product: Product
  messages: EditMessages
  onSuccess: () => void
}

const SECTION = 'fs-xs fw-bold text-muted uppercase tracking-widest mb-3 mt-5 block'

export default function EditProductForm({ product, messages, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const isUpdating = useAppSelector(selectProductUpdating)

  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const schema = useMemo(() => createAddProductSchema(messages), [messages])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddProductFormValues, unknown, AddProductFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      brand: product.brand ?? '',
      sku: product.sku ?? '',
      discount: product.discount != null ? String(product.discount) : '',
      tags: (product.tags ?? []).join(', '),
      keyFeatures: (product.keyFeatures ?? []).join('\n'),
      specifications: product.specifications ?? [],
      weightValue: product.weight?.value != null ? String(product.weight.value) : '',
      weightUnit: product.weight?.unit ?? 'g',
      dimensionsLength: product.dimensions?.length != null ? String(product.dimensions.length) : '',
      dimensionsWidth: product.dimensions?.width != null ? String(product.dimensions.width) : '',
      dimensionsHeight: product.dimensions?.height != null ? String(product.dimensions.height) : '',
      dimensionsUnit: product.dimensions?.unit ?? 'cm',
    },
  })

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specifications',
  })

  useEffect(() => {
    return () => newPreviews.forEach(URL.revokeObjectURL)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    setNewImages((prev) => [...prev, ...arr])
    setNewPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))])
  }

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx])
    setNewImages((prev) => prev.filter((_, i) => i !== idx))
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (values: AddProductFormValues) => {
    const fd = buildProductFormData(values, newImages)
    const result = await dispatch(updateProductThunk({ id: product._id, formData: fd }))
    if (updateProductThunk.fulfilled.match(result)) onSuccess()
  }

  const categoryOptions = PRODUCT_CATEGORIES.map((cat) => ({ value: cat, label: messages.categories[cat.toLowerCase()] ?? cat }))
  const weightUnitOptions = WEIGHT_UNITS.map((u) => ({ value: u, label: u }))
  const dimUnitOptions = DIMENSION_UNITS.map((u) => ({ value: u, label: u }))
  const existingImages = product.images.map(getImageUrl)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 mt-2 max-h-[70vh] overflow-y-auto pr-1 custom-form-scroll">

      {/* ── Basic Info ── */}
      <span className={SECTION}>Basic Information</span>

      <Input label="Product name" type="text" error={errors.name?.message} {...register('name')} />
      <Textarea label="Description" error={errors.description?.message} {...register('description')} />

      <div className="flex gap-4">
        <Input label="Price (₹)" type="number" step="0.01" min="0" error={errors.price?.message} {...register('price')} />
        <Input label="Stock" type="number" min="0" error={errors.stock?.message} {...register('stock')} />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Dropdown label="Category" placeholder={messages.category_placeholder} options={categoryOptions} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.category?.message} />
            )}
          />
        </div>
        <div className="flex-1">
          <Input label="Discount (%)" type="number" min="0" max="100" placeholder="e.g. 10" error={errors.discount?.message} {...register('discount')} />
        </div>
      </div>

      <div className="flex gap-4">
        <Input label="Brand" type="text" placeholder="e.g. Sony" {...register('brand')} />
        <Input label="SKU" type="text" placeholder="e.g. SNY-WH1000XM5-BLK" {...register('sku')} />
      </div>

      {/* ── Images ── */}
      <span className={SECTION}>Product Images</span>

      {existingImages.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="fs-sm fw-medium text-secondary">Current images</span>
          <div className="img-preview-grid">
            {existingImages.map((url) => (
              <div key={url} className="img-preview-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Existing" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="fs-sm fw-medium text-secondary">
          Add new images <span className="text-muted fw-normal">(replaces existing)</span>
        </span>
        <button type="button" className="img-upload-area" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={24} className="text-muted" style={{ margin: '0 auto 8px' }} />
          <p className="fs-sm text-secondary">Click to select images</p>
          {newImages.length > 0 && <p className="fs-sm text-accent fw-semibold mt-1">{newImages.length} selected</p>}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple aria-label="Add new product images" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        {newPreviews.length > 0 && (
          <div className="img-preview-grid">
            {newPreviews.map((url, idx) => (
              <div key={url} className="img-preview-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`New ${idx + 1}`} />
                <button type="button" className="img-preview-remove btn-icon" onClick={() => removeNewImage(idx)} aria-label="Remove"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tags & Features ── */}
      <span className={SECTION}>Tags & Key Features</span>

      <Input label="Tags" type="text" placeholder='e.g. wireless, bluetooth, anc (comma-separated)' {...register('tags')} />
      <Textarea label="Key Features" placeholder={'One feature per line:\n40hr battery\nActive Noise Cancellation'} {...register('keyFeatures')} />

      {/* ── Specifications ── */}
      <span className={SECTION}>Specifications</span>

      <div className="flex flex-col gap-2">
        {specFields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 items-start">
            <Input label={idx === 0 ? 'Key' : undefined} placeholder="e.g. Color" {...register(`specifications.${idx}.key`)} />
            <Input label={idx === 0 ? 'Value' : undefined} placeholder="e.g. Midnight Black" {...register(`specifications.${idx}.value`)} />
            <button type="button" onClick={() => removeSpec(idx)} className="admin-delete-btn mt-auto mb-0.5 flex-shrink-0" aria-label="Remove"><Trash2 size={14} /></button>
          </div>
        ))}
        <button type="button" onClick={() => appendSpec({ key: '', value: '' })} className="admin-edit-btn self-start gap-2 px-3 w-auto">
          <Plus size={14} />
          <span className="fs-xs fw-medium">Add specification</span>
        </button>
      </div>

      {/* ── Physical ── */}
      <span className={SECTION}>Physical Details</span>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input label="Weight" type="number" min="0" step="0.01" placeholder="e.g. 250" {...register('weightValue')} />
        </div>
        <div className="w-28">
          <Controller
            name="weightUnit"
            control={control}
            render={({ field }) => (
              <Dropdown label="Unit" options={weightUnitOptions} value={field.value ?? 'g'} onChange={field.onChange} onBlur={field.onBlur} />
            )}
          />
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <Input label="Length" type="number" min="0" step="0.1" placeholder="L" {...register('dimensionsLength')} />
        <Input label="Width" type="number" min="0" step="0.1" placeholder="W" {...register('dimensionsWidth')} />
        <Input label="Height" type="number" min="0" step="0.1" placeholder="H" {...register('dimensionsHeight')} />
        <div className="w-28">
          <Controller
            name="dimensionsUnit"
            control={control}
            render={({ field }) => (
              <Dropdown label="Unit" options={dimUnitOptions} value={field.value ?? 'cm'} onChange={field.onChange} onBlur={field.onBlur} />
            )}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" size="md" fullWidth disabled={isUpdating} className="mt-2 mb-1">
        {isUpdating ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
