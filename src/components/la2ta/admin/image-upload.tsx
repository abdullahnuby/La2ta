'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { uploadImage } from '@/hooks/use-la2ta-api'

/** Image picker: file upload → Supabase Storage, or paste a URL directly */
export default function ImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const onFile = async (file: File) => {
    setUploading(true)
    try {
      const { url } = await uploadImage(file)
      onChange(url)
    } catch (err) {
      throw err
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted">
          <Image
            src={value}
            alt="معاينة الصورة"
            fill
            sizes="500px"
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute end-2 top-2 grid size-8 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-destructive"
            aria-label="إزالة الصورة"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40 hover:text-accent-foreground"
        >
          {uploading ? (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="text-sm font-bold">بيتم الرفع...</span>
            </>
          ) : (
            <>
              <ImagePlus className="size-8" />
              <span className="text-sm font-bold">اضغط لرفع صورة العرض</span>
              <span className="text-xs font-medium">PNG أو JPG · حتى 5 ميجا</span>
            </>
          )}
        </button>
      )}
      <Input
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... (اختياري — رابط صورة)"
        className="rounded-xl text-xs"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f).catch(() => {})
          e.target.value = ''
        }}
      />
    </div>
  )
}
