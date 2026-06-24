'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X, Package, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Input from '@/src/components/ui/Input'
import Textarea from '@/src/components/ui/Textarea'
import Dropdown from '@/src/components/ui/Dropdown'
import Button from '@/src/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { addProductThunk, selectProductsAdding } from '@/src/store/slices/productSlice'
import { selectAuth, selectIsHydrated } from '@/src/store/slices/authSlice'
import { ROUTES } from '@/src/routes'
import { createAddProductSchema, buildProductFormData } from './schemas/addProductSchema'
import type { AddProductFormValues } from './schemas/addProductSchema'
import { PRODUCT_CATEGORIES, WEIGHT_UNITS, DIMENSION_UNITS } from '@/src/types/product'

interface AddProductDict {
  heading: string
  subheading: string
  name_label: string
  name_placeholder: string
  description_label: string
  description_placeholder: string
  price_label: string
  price_placeholder: string
  category_label: string
  category_placeholder: string
  stock_label: string
  stock_placeholder: string
  images_label: string
  images_hint: string
  images_selected: string
  submit: string
  loading: string
  not_admin: string
  categories: Record<string, string>
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
  error_images_required: string
}

interface Props {
  dict: AddProductDict
  lang: string
}

const SECTION = 'fs-xs fw-bold text-muted uppercase tracking-widest mb-3 mt-6 block'

export default function AddProductForm({ dict, lang }: Props) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dispatch = useAppDispatch()
  const isAdding = useAppSelector(selectProductsAdding)
  const { user } = useAppSelector(selectAuth)
  const isHydrated = useAppSelector(selectIsHydrated)
  const router = useRouter()

  const schema = useMemo(() => createAddProductSchema(dict), [dict])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { specifications: [], weightUnit: 'g', dimensionsUnit: 'cm' },
  })

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specifications',
  })

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace(ROUTES.products(lang))
  }, [user, router, lang])

  useEffect(() => {
    return () => previews.forEach(URL.revokeObjectURL)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    setImages((prev) => [...prev, ...arr])
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))])
    setImageError('')
  }

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (values: AddProductFormValues) => {
    if (images.length === 0) { setImageError(dict.error_images_required); return }
    const fd = buildProductFormData(values, images)
    const result = await dispatch(addProductThunk(fd))
    if (addProductThunk.fulfilled.match(result)) {
      reset({ specifications: [], weightUnit: 'g', dimensionsUnit: 'cm' })
      previews.forEach(URL.revokeObjectURL)
      setImages([])
      setPreviews([])
      setImageError('')
    }
  }

  const categoryOptions = PRODUCT_CATEGORIES.map((cat) => ({ value: cat, label: dict.categories[cat.toLowerCase()] ?? cat }))
  const weightUnitOptions = WEIGHT_UNITS.map((u) => ({ value: u, label: u }))
  const dimUnitOptions = DIMENSION_UNITS.map((u) => ({ value: u, label: u }))

  if (!isHydrated) {
    return <div className="admin-page flex items-center justify-center"><div className="auth-loading-spinner" /></div>
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-page flex flex-col items-center justify-center gap-4 text-center">
        <Package size={48} className="text-muted" />
        <p className="text-body text-secondary">{dict.not_admin}</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="mb-8">
        <p className="text-overline text-accent mb-2">Admin Panel</p>
        <h1 className="text-h2 text-primary mb-2">{dict.heading}</h1>
        <p className="text-body text-secondary">{dict.subheading}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

        {/* ── Basic Info ── */}
        <span className={SECTION}>Basic Information</span>

        <Input label={dict.name_label} type="text" placeholder={dict.name_placeholder} error={errors.name?.message} {...register('name')} />
        <Textarea label={dict.description_label} placeholder={dict.description_placeholder} error={errors.description?.message} {...register('description')} />

        <div className="flex gap-4">
          <Input label={dict.price_label} type="number" step="0.01" min="0" placeholder={dict.price_placeholder} error={errors.price?.message} {...register('price')} />
          <Input label={dict.stock_label} type="number" min="0" placeholder={dict.stock_placeholder} error={errors.stock?.message} {...register('stock')} />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Dropdown label={dict.category_label} placeholder={dict.category_placeholder} options={categoryOptions} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.category?.message} />
              )}
            />
          </div>
          <div className="flex-1">
            <Input label="Discount (%)" type="number" min="0" max="100" placeholder="e.g. 10" error={errors.discount?.message} {...register('discount')} />
          </div>
        </div>

        <div className="flex gap-4">
          <Input label="Brand" type="text" placeholder="e.g. Sony" error={errors.brand?.message} {...register('brand')} />
          <Input label="SKU" type="text" placeholder="e.g. SNY-WH1000XM5-BLK" error={errors.sku?.message} {...register('sku')} />
        </div>

        {/* ── Images ── */}
        <span className={SECTION}>Product Images</span>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className={`img-upload-area${dragOver ? ' img-upload-area--active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          >
            <ImagePlus size={32} className="text-muted" style={{ margin: '0 auto 12px' }} />
            <p className="text-body-sm text-secondary">{dict.images_hint}</p>
            {images.length > 0 && <p className="fs-sm text-accent fw-semibold mt-2">{images.length} {dict.images_selected}</p>}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple aria-label={dict.images_label} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          {imageError && <p className="input-error-msg" role="alert">{imageError}</p>}
          {previews.length > 0 && (
            <div className="img-preview-grid">
              {previews.map((url, idx) => (
                <div key={url} className="img-preview-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Preview ${idx + 1}`} />
                  <button type="button" className="img-preview-remove btn-icon" onClick={() => removeImage(idx)} aria-label="Remove image"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Tags & Features ── */}
        <span className={SECTION}>Tags & Key Features</span>

        <Input label="Tags" type="text" placeholder='e.g. wireless, bluetooth, anc (comma-separated)' {...register('tags')} />
        <Textarea label="Key Features" placeholder={'One feature per line:\n40hr battery\nActive Noise Cancellation\nUSB-C charging'} {...register('keyFeatures')} />

        {/* ── Specifications ── */}
        <span className={SECTION}>Specifications</span>

        <div className="flex flex-col gap-2">
          {specFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <Input label={idx === 0 ? 'Key' : undefined} placeholder="e.g. Color" {...register(`specifications.${idx}.key`)} />
              <Input label={idx === 0 ? 'Value' : undefined} placeholder="e.g. Midnight Black" {...register(`specifications.${idx}.value`)} />
              <button type="button" onClick={() => removeSpec(idx)} className="admin-delete-btn mt-auto mb-0.5 flex-shrink-0" aria-label="Remove spec"><Trash2 size={14} /></button>
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

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isAdding} className="mt-4">
          {isAdding ? dict.loading : dict.submit}
        </Button>

      </form>
    </div>
  )
}
