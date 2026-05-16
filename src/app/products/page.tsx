'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase, Product } from '@/lib/supabase'
import StockBadge from '@/components/StockBadge'
import { Plus, Search, Package, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/auth'

type SortKey = 'name' | 'current_stock'
type SortDir = 'asc' | 'desc'

export default function ProductsPage() {
  const { isLoggedIn } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(*)')
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return products
      .filter(p => p.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const mul = sortDir === 'asc' ? 1 : -1
        if (sortKey === 'name') return mul * a.name.localeCompare(b.name, 'th')
        return mul * (a.current_stock - b.current_stock)
      })
  }, [products, search, sortKey, sortDir])

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={13} className="opacity-40" />
    return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>กำลังโหลด...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>ทรัพยากรทั้งหมด</h1>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>{products.length} รายการ</p>
        </div>
        {isLoggedIn && (
          <Link
            href="/products/new"
            className="flex items-center gap-2 text-white px-3 py-2.5 sm:px-4 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--primary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">เพิ่มทรัพยากร</span>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="ค้นหาชื่อทรัพยากร..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: 'var(--muted)' }}>
          <Package size={40} />
          <p>ไม่พบทรัพยากร</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {filtered.map(p => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="flex items-center justify-between p-4 rounded-xl transition-colors hover:opacity-80"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-medium truncate" style={{ color: 'var(--foreground)' }}>{p.name}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    คงเหลือ: <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{p.current_stock} {p.unit}</span>
                  </div>
                </div>
                <StockBadge current={p.current_stock} min={p.min_stock} />
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-x-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
                      ทรัพยากร <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button onClick={() => toggleSort('current_stock')} className="flex items-center gap-1.5 font-medium hover:opacity-70 transition-opacity ml-auto" style={{ color: 'var(--muted)' }}>
                      คงเหลือ <SortIcon col="current_stock" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>สถานะ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--background)')}
                    onMouseOut={e => (e.currentTarget.style.background = '')}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{p.name}</td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--foreground)' }}>
                      {p.current_stock} {p.unit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge current={p.current_stock} min={p.min_stock} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/products/${p.id}`} className="font-medium" style={{ color: 'var(--primary)' }}>
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
