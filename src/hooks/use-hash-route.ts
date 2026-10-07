'use client'

import { useCallback, useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'offer'; id: number }
  | { name: 'admin' }

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '')
  if (h.startsWith('o/')) {
    const id = Number.parseInt(h.slice(2), 10)
    if (Number.isFinite(id)) return { name: 'offer', id }
  }
  if (h === 'admin') return { name: 'admin' }
  return { name: 'home' }
}

function routeToHash(r: Route): string {
  if (r.name === 'admin') return '#/admin'
  if (r.name === 'offer') return `#/o/${r.id}`
  return '#/'
}

/**
 * Tiny hash-based router so everything lives on the single "/" page:
 *   #/          → home
 *   #/o/{id}    → offer details
 *   #/admin     → admin dashboard
 * Back/forward browser buttons keep working.
 */
export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(typeof window === 'undefined' ? '' : window.location.hash)
  )

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((r: Route) => {
    const hash = routeToHash(r)
    if (window.location.hash === hash) setRoute(r)
    else window.location.hash = hash
    window.scrollTo({ top: 0 })
  }, [])

  return [route, navigate]
}
