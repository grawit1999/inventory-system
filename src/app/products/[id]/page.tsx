'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Product, StockMovement } from '@/lib/supabase'
import StockBadge from '@/components/StockBadge'
import { ArrowLeft, Edit, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
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
    if (!confirm('ต้องการลบสินค้านี้?')) return
    await supabase.from('products').delete().eq('id', id)
    router.push('/products')
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>
  if (!product) return <div className="text-center py-16 text-gray-400">ไม่พบสินค้า</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/products" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-blue-600/100 dark:text-sky-400/100">{product.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/products/${id}/edit`}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Edit size={15} /> แก้ไข
          </Link>
          <button onClick={handleDelete}
            className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Trash2 size={15} /> ลบ
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-blue-600/100 dark:text-sky-400/100">ข้อมูลสินค้า</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['SKU', product.sku ?? '-'],
              ['หมวดหมู่', product.categories?.name ?? '-'],
              ['หน่วย', product.unit],
              ['ราคาต่อหน่วย', product.price > 0 ? `฿${product.price.toLocaleString()}` : '-'],
              ['สต็อกขั้นต่ำ', `${product.min_stock} ${product.unit}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-blue-600/100 dark:text-sky-400/100">{value}</dd>
              </div>
            ))}
            {product.description && (
              <div>
                <dt className="text-gray-500 mb-1">รายละเอียด</dt>
                <dd className="text-gray-700">{product.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center gap-3">
          <div className="text-5xl font-bold text-blue-600/100 dark:text-sky-400/100">{product.current_stock}</div>
          <div className="text-gray-500">{product.unit}</div>
          <StockBadge current={product.current_stock} min={product.min_stock} />
          <Link
            href={`/movements/new?product=${id}`}
            className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            บันทึกรับ/จ่ายสินค้า
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-blue-600/100 dark:text-sky-400/100 mb-4">ประวัติการเคลื่อนไหว</h2>
        {movements.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">ยังไม่มีประวัติ</p>
        ) : (
          <div className="space-y-2">
            {movements.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {m.type === 'in' ? (
                    <ArrowDownCircle size={18} className="text-green-500 shrink-0" />
                  ) : (
                    <ArrowUpCircle size={18} className="text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-blue-600/100 dark:text-sky-400/100">{m.type === 'in' ? 'รับสินค้า' : 'จ่ายสินค้า'}</p>
                    <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString('th-TH')}</p>
                    {m.note && <p className="text-xs text-gray-500 mt-0.5">{m.note}</p>}
                  </div>
                </div>
                <span className={`text-sm font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
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
