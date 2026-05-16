'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Product, StockMovement } from '@/lib/supabase'
import StockBadge from '@/components/StockBadge'
import { ArrowLeft, Edit, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: prod }, { data: moves }] = await Promise.all([
        supabase.from('products').select('*, categories(*)').eq('id', id).single(),
        supabase.from('stock_movements').select('*').eq('product_id', id).order('created_at', { ascending: false }).limit(20),
      ])
      setProduct(prod)
      setMovements(moves ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleDelete() {
    if (!confirm('ต้องการลบทรัพยากรนี้?')) return
    await supabase.from('products').delete().eq('id', id)
    router.push('/products')
  }

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>กำลังโหลด...</div>
  if (!product) return <div className="text-center py-16" style={{ color: 'var(--muted)' }}>ไม่พบทรัพยากร</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/products" className="transition-colors shrink-0" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold truncate" style={{ color: 'var(--primary)' }}>{product.name}</h1>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/products/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <Edit size={15} />
              <span className="hidden sm:inline">แก้ไข</span>
            </Link>
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <Trash2 size={15} />
              <span className="hidden sm:inline">ลบ</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--primary)' }}>ข้อมูลทรัพยากร</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['หน่วย', product.unit],
              ['สต็อกขั้นต่ำ', `${product.min_stock} ${product.unit}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt style={{ color: 'var(--muted)' }}>{label}</dt>
                <dd className="font-medium" style={{ color: 'var(--foreground)' }}>{value}</dd>
              </div>
            ))}
            {product.description && (
              <div>
                <dt className="mb-1" style={{ color: 'var(--muted)' }}>รายละเอียด</dt>
                <dd style={{ color: 'var(--foreground)' }}>{product.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl p-5 flex flex-col items-center justify-center gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="text-5xl font-bold" style={{ color: 'var(--primary)' }}>{product.current_stock}</div>
          <div style={{ color: 'var(--muted)' }}>{product.unit}</div>
          <StockBadge current={product.current_stock} min={product.min_stock} />
          {isLoggedIn && (
            <Link
              href={`/movements/new?product=${id}`}
              className="mt-2 w-full text-center text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--primary)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}
            >
              บันทึกรับ/จ่ายทรัพยากร
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--primary)' }}>ประวัติการเคลื่อนไหว</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>ยังไม่มีประวัติ</p>
        ) : (
          <div className="space-y-2">
            {movements.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-2 p-3 rounded-lg hover:opacity-80">
                <div className="flex items-center gap-3 min-w-0">
                  {m.type === 'in' ? (
                    <ArrowDownCircle size={18} className="text-green-500 shrink-0" />
                  ) : (
                    <ArrowUpCircle size={18} className="text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{m.type === 'in' ? 'รับทรัพยากร' : 'จ่ายทรัพยากร'}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(m.created_at).toLocaleString('th-TH')}</p>
                    {m.note && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{m.note}</p>}
                  </div>
                </div>
                <span className={`text-sm font-bold shrink-0 ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.type === 'in' ? '+' : '-'}{m.quantity} {product.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
