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
    { label: 'สินค้าทั้งหมด', value: totalProducts, icon: Package, text: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'สินค้าหมด', value: outOfStock, icon: AlertTriangle, text: 'text-red-600', bg: 'bg-red-50' },
    { label: 'ใกล้หมด', value: lowStock, icon: AlertTriangle, text: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'มูลค่าคงคลัง', value: `฿${totalValue.toLocaleString()}`, icon: TrendingUp, text: 'text-green-600', bg: 'bg-green-50' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-600/100 dark:text-sky-400/100">ภาพรวมคลังสินค้า</h1>
        <p className="text-gray-500 mt-1">สรุปสถานะสินค้าคงคลัง</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, text, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={text} size={20} />
            </div>
            <div className="text-2xl font-bold text-blue-600/100 dark:text-sky-400/100">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-blue-600/100 dark:text-sky-400/100 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-500" />
            สินค้าที่ต้องเติม
          </h2>
          {products.filter(p => p.current_stock <= p.min_stock).length === 0 ? (
            <p className="text-gray-400 text-sm">ไม่มีสินค้าที่ต้องเติม</p>
          ) : (
            <div className="space-y-2">
              {products
                .filter(p => p.current_stock <= p.min_stock)
                .slice(0, 6)
                .map(p => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-blue-600/100 dark:text-sky-400/100">{p.name}</span>
                    <span className={`text-sm font-bold ${p.current_stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {p.current_stock} {p.unit}
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-blue-600/100 dark:text-sky-400/100 mb-4 flex items-center gap-2">
            <ArrowUpCircle size={18} className="text-blue-500" />
            การเคลื่อนไหวล่าสุด
          </h2>
          {recentMovements.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีการรับ/จ่ายสินค้า</p>
          ) : (
            <div className="space-y-2">
              {recentMovements.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {m.type === 'in' ? (
                      <ArrowDownCircle size={16} className="text-green-500 shrink-0" />
                    ) : (
                      <ArrowUpCircle size={16} className="text-red-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-blue-600/100 dark:text-sky-400/100">{m.products?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString('th-TH')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
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
