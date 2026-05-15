'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Product } from '@/lib/supabase'
import StockBadge from '@/components/StockBadge'
import { Plus, Search, Package } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(*)')
      .order('name')
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600/100 dark:text-sky-400/100">สินค้าทั้งหมด</h1>
          <p className="text-gray-500 mt-1">{products.length} รายการ</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          เพิ่มสินค้า
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
          <Package size={40} />
          <p>ไม่พบสินค้า</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">สินค้า</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">หมวดหมู่</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">คงเหลือ</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ราคา</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">สถานะ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-blue-600/100 dark:text-sky-400/100">{p.name}</div>
                    {p.sku && <div className="text-xs text-gray-400">SKU: {p.sku}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.categories?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-blue-600/100 dark:text-sky-400/100">
                    {p.current_stock} {p.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {p.price > 0 ? `฿${p.price.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StockBadge current={p.current_stock} min={p.min_stock} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${p.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
