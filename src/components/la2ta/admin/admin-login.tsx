'use client'

import { useState } from 'react'
import { Flame, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdminStore } from '@/lib/api-client'

export default function AdminLogin() {
  const setToken = useAdminStore((s) => s.setToken)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'كلمة المرور غلط')
      setToken('session')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-14">
      <Card className="w-full rounded-3xl border shadow-lg">
        <CardHeader className="items-center space-y-2 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <Flame className="size-7" strokeWidth={2.5} />
          </span>
          <CardTitle className="text-2xl font-black">لوحة تحكم لقطة</CardTitle>
          <p className="text-sm font-medium text-muted-foreground">
            ادخل كلمة المرور لإدارة العروض والمحلات والتصنيفات
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="h-12 rounded-2xl ps-10 text-base font-semibold"
                />
              </div>
              {error && (
                <p className="text-sm font-bold text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || !password.trim()}
              className="h-12 w-full rounded-2xl text-base font-bold"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                'دخول'
              )}
            </Button>
            <a
              href="#/"
              className="block text-center text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
            >
              ← رجوع للموقع
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
