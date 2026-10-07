'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/hooks/use-la2ta-api'

const MAX_IMAGES = 5

function parseGallery(value: string): string[] {
  const trimmed = value.trim()

  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)

    if (Array.isArray(parsed)) {
      return parsed
        .filter((url): url is string => typeof url === 'string')
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, MAX_IMAGES)
    }
  } catch {
    // Legacy single URL.
  }

  return [trimmed]
}

function encodeGallery(urls: string[]) {
  return JSON.stringify(
    urls.filter(Boolean).slice(0, MAX_IMAGES)
  )
}

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const images = parseGallery(value)

  const commit = (next: string[]) => {
    onChange(encodeGallery([...new Set(next)].slice(0, MAX_IMAGES)))
  }

  const onFiles = async (files: File[]) => {
    if (files.length === 0) return

    const available = MAX_IMAGES - images.length

    if (available <= 0) {
      return
    }

    const selected = files.slice(0, available)

    setUploading(true)

    try {
      const uploaded = await Promise.all(
        selected.map(async (file) => {
          const result = await uploadImage(file)
          return result.url
        })
      )

      commit([...images, ...uploaded])
    } finally {
      setUploading(false)
    }
  }

  const addUrl = () => {
    const url = urlInput.trim()

    if (!url || images.length >= MAX_IMAGES) return

    try {
      new URL(url)
    } catch {
      return
    }

    commit([...images, url])
    setUrlInput('')
  }

  const remove = (index: number) => {
    commit(images.filter((_, imageIndex) => imageIndex !== index))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction

    if (target < 0 || target >= images.length) return

    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    commit(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-foreground">
            صور العرض
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            حتى {MAX_IMAGES} صور — أول صورة هي الغلاف والرئيسية عند الشير
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-2xl border bg-muted"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={url}
                  alt={`صورة العرض ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 180px"
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="absolute inset-x-1.5 top-1.5 flex items-center justify-between gap-1">
                <span className="rounded-full bg-black/65 px-2 py-1 text-[10px] font-black text-white backdrop-blur-sm">
                  {index === 0 ? 'رئيسية 🔥' : `صورة ${index + 1}`}
                </span>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="grid size-7 place-items-center rounded-full bg-black/70 text-white hover:bg-destructive"
                  aria-label={`حذف الصورة ${index + 1}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="absolute bottom-1.5 start-1.5 grid size-7 place-items-center rounded-full bg-black/65 text-white backdrop-blur-sm"
                  aria-label="جعل الصورة أقرب للرئيسية"
                  title="تقديم الصورة"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              )}

              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="absolute bottom-1.5 end-1.5 grid size-7 place-items-center rounded-full bg-black/65 text-white backdrop-blur-sm"
                  aria-label="تأخير الصورة"
                  title="تأخير الصورة"
                >
                  <ArrowLeft className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || images.length >= MAX_IMAGES}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input px-4 py-5 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40 hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-sm font-bold">
              بنرفع الصور...
            </span>
          </>
        ) : images.length >= MAX_IMAGES ? (
          <>
            <Star className="size-7 text-primary" />
            <span className="text-sm font-bold">
              وصلت للحد الأقصى: 5 صور
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="size-8" />
            <span className="text-sm font-bold">
              اضغط لاختيار صور العرض
            </span>
            <span className="text-xs font-medium">
              JPG أو PNG أو WebP · حتى 5 ميجا للصورة
            </span>
          </>
        )}
      </button>

      <div className="flex gap-2">
        <Input
          dir="ltr"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addUrl()
            }
          }}
          placeholder="https://... (إضافة صورة برابط)"
          className="rounded-xl text-xs"
          disabled={images.length >= MAX_IMAGES}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addUrl}
          disabled={!urlInput.trim() || images.length >= MAX_IMAGES}
          className="shrink-0 rounded-xl font-bold"
        >
          إضافة
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? [])
          void onFiles(selected)
          event.target.value = ''
        }}
      />
    </div>
  )
}
