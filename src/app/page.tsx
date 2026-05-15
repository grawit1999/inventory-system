'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Product, StockMovement } from '@/lib/supabase'
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: prods }, { data: moves }] = await Promise.all([
        supabase.from('products').select('*, categories(*)').order('name'),
        supabase
          .from('stock_movements')
          .select('*, products(name, unit)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      setProducts(prods ?? [])
      setRecentMovements(moves ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalProducts = products.length
  const outOfStock = products.filter(p => p.current_stock === 0).length
  const lowStock = products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock).length
  const totalValue = products.reduce((sum, p) => sum + p.current_stock * p.price, 0)

  const stats = [
    { label: 'ทรัพยากรทั้งหมด', value: totalProducts, icon: Package, text: 'text-red-600', bg: 'bg-red-50', isPrimary: true },
    { label: 'ทรัพยากรหมด', value: outOfStock, icon: AlertTriangle, text: 'text-red-600', bg: 'bg-red-50', isPrimary: false },
    { label: 'ใกล้หมด', value: lowStock, icon: AlertTriangle, text: 'text-yellow-600', bg: 'bg-yellow-50', isPrimary: false },
    { label: 'มูลค่าคงคลัง', value: `฿${totalValue.toLocaleString()}`, icon: TrendingUp, text: 'text-green-600', bg: 'bg-green-50', isPrimary: false },
  ]

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>กำลังโหลด...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>ภาพรวมคลังทรัพยากร</h1>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>สรุปสถานะทรัพยากรคงคลัง</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, text, bg, isPrimary }) => (
          <div key={label} className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className={`inline-flex p-2 rounded-lg ${isPrimary ? '' : bg} mb-3`} style={isPrimary ? { background: 'var(--primary-light)' } : {}}>
              <Icon className={isPrimary ? '' : text} size={20} style={isPrimary ? { color: 'var(--primary)' } : {}} />
            </div>
            <div className="text-2xl font-bold" style={{ color: isPrimary ? 'var(--primary)' : undefined }}>{value}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <AlertTriangle size={18} className="text-yellow-500" />
            ทรัพยากรที่ต้องเติม
          </h2>
          {products.filter(p => p.current_stock <= p.min_stock).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>ไม่มีทรัพยากรที่ต้องเติม</p>
          ) : (
            <div className="space-y-2">
              {products
                .filter(p => p.current_stock <= p.min_stock)
                .slice(0, 6)
                .map(p => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg transition-colors hover:opacity-80"
                  >
                    <span className="text-sm font-medium truncate min-w-0" style={{ color: 'var(--primary)' }}>{p.name}</span>
                    <span className={`text-sm font-bold shrink-0 ${p.current_stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {p.current_stock} {p.unit}
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <ArrowUpCircle size={18} className="text-blue-500" />
            การเคลื่อนไหวล่าสุด
          </h2>
          {recentMovements.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>ยังไม่มีการรับ/จ่ายทรัพยากร</p>
          ) : (
            <div className="space-y-2">
              {recentMovements.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-2 p-3 rounded-lg hover:opacity-80">
                  <div className="flex items-center gap-3 min-w-0">
                    {m.type === 'in' ? (
                      <ArrowDownCircle size={16} className="text-green-500 shrink-0" />
                    ) : (
                      <ArrowUpCircle size={16} className="text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--primary)' }}>{m.products?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(m.created_at).toLocaleString('th-TH')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'in' ? '+' : '-'}{m.quantity} {m.products?.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
