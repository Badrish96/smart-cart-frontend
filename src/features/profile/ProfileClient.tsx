'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Plus, Pencil, Trash2, MapPin, Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { selectAuth, updateProfileThunk, fetchProfileThunk, selectIsFetchingProfile } from '@/src/store/slices/authSlice'
import { profileService } from '@/src/services/profile.service'
import type { User, Address, AddressPayload, Gender } from '@/src/types/auth'
import Input from '@/src/components/ui/Input/Input'
import Button from '@/src/components/ui/Button/Button'
import DatePicker from '@/src/components/ui/DatePicker/DatePicker'

type Tab = 'info' | 'addresses'

interface Dict {
  heading: string
  tab_info: string
  tab_addresses: string
  name_label: string
  email_label: string
  phone_label: string
  phone_placeholder: string
  dob_label: string
  gender_label: string
  gender_male: string
  gender_female: string
  gender_other: string
  gender_prefer_not: string
  picture_label: string
  picture_hint: string
  save: string
  saving: string
  add_address: string
  edit_address: string
  delete_address: string
  set_default: string
  default_badge: string
  address_label: string
  address_fullname: string
  address_phone: string
  address_street: string
  address_city: string
  address_state: string
  address_zip: string
  address_country: string
  address_save: string
  address_saving: string
  no_addresses: string
  confirm_delete_address: string
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function UserAvatar({ url, name, size = 96 }: { url?: string; name: string; size?: number }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} width={size} height={size}
        className="rounded-full object-cover" style={{ width: size, height: size }} />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center fw-bold text-white bg-accent"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function AddressForm({
  initial, dict, onSave, onCancel,
}: {
  initial?: Partial<AddressPayload>
  dict: Dict
  onSave: (data: AddressPayload) => Promise<void>
  onCancel: () => void
}) {
  const empty: AddressPayload = { label: '', fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: '' }
  const [form, setForm] = useState<AddressPayload>({ ...empty, ...initial })
  const [saving, setSaving] = useState(false)

  const set = (key: keyof AddressPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  const fields: Array<{ key: keyof AddressPayload; label: string; required?: boolean }> = [
    { key: 'label',    label: dict.address_label,    required: false },
    { key: 'fullName', label: dict.address_fullname, required: true },
    { key: 'phone',    label: dict.address_phone,    required: true },
    { key: 'street',   label: dict.address_street,   required: true },
    { key: 'city',     label: dict.address_city,     required: true },
    { key: 'state',    label: dict.address_state,    required: true },
    { key: 'zipCode',  label: dict.address_zip,      required: true },
    { key: 'country',  label: dict.address_country,  required: true },
  ]

  return (
    <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, required }) => (
          <Input key={key} label={label} value={form[key] as string ?? ''} onChange={set(key)} required={required} />
        ))}
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" disabled={saving}>
          {saving ? dict.address_saving : dict.address_save}
        </Button>
      </div>
    </form>
  )
}

// ── Personal info form ────────────────────────────────────────────────────────
// Isolated into its own component so that its useState calls (lazy initializers)
// re-run from the correct user object whenever the parent gives it a new `key`.

interface InfoFormProps {
  user: User
  dict: Dict
  isLoading: boolean
  onSave: (fd: FormData | Record<string, string>) => void
}

function ProfileInfoForm({ user, dict, isLoading, onSave }: InfoFormProps) {
  const [name, setName]   = useState(() => user.name ?? '')
  const [phone, setPhone] = useState(() => user.phone ?? '')
  const [dob, setDob]     = useState(() => user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '')
  const [gender, setGender] = useState<Gender | ''>(() => user.gender ?? '')
  const [picFile, setPicFile]     = useState<File | null>(null)
  const [picPreview, setPicPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const avatarUrl = picPreview ?? user.profilePicture?.url

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPicFile(file)
    setPicPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (picFile) {
      const fd = new FormData()
      fd.append('name', name)
      if (phone) fd.append('phone', phone)
      if (dob) fd.append('dateOfBirth', dob)
      if (gender) fd.append('gender', gender)
      fd.append('profilePicture', picFile)
      onSave(fd)
    } else {
      onSave({
        name,
        ...(phone ? { phone } : {}),
        ...(dob ? { dateOfBirth: dob } : {}),
        ...(gender ? { gender } : {}),
      })
    }
  }

  const genderOptions: [Gender, string][] = [
    ['male', dict.gender_male],
    ['female', dict.gender_female],
    ['other', dict.gender_other],
    ['prefer_not_to_say', dict.gender_prefer_not],
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar upload */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <UserAvatar url={avatarUrl} name={user.name} size={88} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center bg-accent"
            aria-label={dict.picture_label}
          >
            <Camera size={14} color="white" />
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePicChange} aria-label={dict.picture_label} />
        </div>
        <div>
          <p className="fs-sm fw-semibold text-primary">{dict.picture_label}</p>
          <p className="fs-xs text-muted">{dict.picture_hint}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input label={dict.name_label} value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label={dict.email_label} value={user.email} disabled />
        <Input label={dict.phone_label} type="tel" placeholder={dict.phone_placeholder} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <DatePicker label={dict.dob_label} value={dob} onChange={setDob} placeholder="Select date of birth" maxDate={new Date()} minYear={1900} />

        <div className="flex flex-col gap-2 sm:col-span-2">
          <span className="fs-sm fw-medium text-secondary">{dict.gender_label}</span>
          <div className="flex gap-3 flex-wrap">
            {genderOptions.map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setGender(val)}
                className={[
                  'px-4 py-2 rounded-full fs-sm fw-medium border transition-colors',
                  gender === val ? 'text-white bg-accent border-accent' : 'text-secondary border-theme',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? dict.saving : dict.save}
        </Button>
      </div>
    </form>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

interface ProfileClientProps {
  dict: Dict
  /** Outer wrapper classes — override when embedding inside a layout that already provides spacing (e.g. AdminLayout). */
  className?: string
}

export default function ProfileClient({ dict, className = 'max-w-3xl mx-auto px-6 max-sm:px-4 mt-20 mb-10' }: ProfileClientProps) {
  const dispatch = useAppDispatch()
  const { user, token, isLoading } = useAppSelector(selectAuth)
  const isFetchingProfile = useAppSelector(selectIsFetchingProfile)
  const [tab, setTab] = useState<Tab>('info')

  // Always fetch fresh profile when this page mounts — guarantees the form
  // receives complete data (phone, DOB, gender, picture) regardless of whether
  // the global ReduxProvider fetch has already run or not.
  useEffect(() => {
    if (token) dispatch(fetchProfileThunk())
  }, [token, dispatch])

  // localAddresses: null → read from Redux (auto-updates when fetchProfileThunk resolves)
  const [localAddresses, setLocalAddresses] = useState<Address[] | null>(null)
  const addresses = localAddresses ?? user?.addresses ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddAddress = async (data: AddressPayload) => {
    const updated = await profileService.addAddress(data)
    setLocalAddresses(updated)
    setShowAddForm(false)
  }

  const handleUpdateAddress = async (id: string, data: AddressPayload) => {
    const updated = await profileService.updateAddress(id, data)
    setLocalAddresses(updated)
    setEditingId(null)
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm(dict.confirm_delete_address)) return
    await profileService.deleteAddress(id)
    setLocalAddresses(addresses.filter((a) => a._id !== id))
  }

  if (!user) return null

  // This key changes when fetchProfileThunk resolves and populates profile-specific
  // fields that weren't in the login cookie. When the key changes, React unmounts
  // and remounts ProfileInfoForm so its lazy useState initializers run with the
  // fully populated user object.
  const infoFormKey = [
    user._id ?? user.id ?? user.email,
    user.phone ?? '',
    user.dateOfBirth ?? '',
    user.gender ?? '',
    user.profilePicture?.url ?? '',
  ].join('|')

  return (
    <div className={className}>
      <h1 className="text-h2 text-primary mb-8">{dict.heading}</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-theme">
        {(['info', 'addresses'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'px-5 py-2.5 fs-sm fw-medium transition-colors',
              tab === t ? 'text-accent border-b-2 border-accent' : 'text-secondary',
            ].join(' ')}
          >
            {t === 'info' ? dict.tab_info : dict.tab_addresses}
          </button>
        ))}
      </div>

      {/* ── Personal Info ── */}
      {tab === 'info' && (
        isFetchingProfile ? (
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-22 h-22 rounded-full bg-secondary" style={{ width: 88, height: 88 }} />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 rounded bg-secondary" />
                <div className="h-3 w-24 rounded bg-secondary" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col gap-2">
                  <div className="h-3 w-20 rounded bg-secondary" />
                  <div className="h-11 rounded-md bg-secondary" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ProfileInfoForm
            key={infoFormKey}
            user={user}
            dict={dict}
            isLoading={isLoading}
            onSave={(payload) => dispatch(updateProfileThunk(payload as Parameters<typeof updateProfileThunk>[0]))}
          />
        )
      )}

      {/* ── Addresses ── */}
      {tab === 'addresses' && (
        <div className="flex flex-col gap-4">
          {addresses.length === 0 && !showAddForm && (
            <div className="flex flex-col items-center gap-3 py-12">
              <MapPin size={48} className="text-muted" />
              <p className="text-body-sm text-muted">{dict.no_addresses}</p>
            </div>
          )}

          {addresses.map((addr) =>
            editingId === addr._id ? (
              <AddressForm
                key={addr._id}
                initial={addr}
                dict={dict}
                onSave={(data) => handleUpdateAddress(addr._id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div key={addr._id} className="card-glass rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="fs-sm fw-semibold text-primary">{addr.label || 'Address'}</span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full fs-xs fw-semibold text-white bg-accent">
                        <Check size={10} /> {dict.default_badge}
                      </span>
                    )}
                  </div>
                  <p className="fs-sm text-secondary">{addr.fullName} · {addr.phone}</p>
                  <p className="fs-sm text-muted">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <Button variant="ghost" size="sm" type="button"
                      onClick={() => handleUpdateAddress(addr._id, { ...addr, isDefault: true })}>
                      {dict.set_default}
                    </Button>
                  )}
                  <button type="button" className="navbar-icon-btn" aria-label={dict.edit_address} onClick={() => setEditingId(addr._id)}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="navbar-icon-btn" aria-label={dict.delete_address} onClick={() => handleDeleteAddress(addr._id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          )}

          {showAddForm ? (
            <AddressForm dict={dict} onSave={handleAddAddress} onCancel={() => setShowAddForm(false)} />
          ) : (
            <Button variant="outline" type="button" icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
              {dict.add_address}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
