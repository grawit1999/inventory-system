'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, StockMovement } from '@/lib/supabase'
import { Plus, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from 'lucide-react'

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('stock_movements')
      .select('*, products(name, unit, categories(name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMovements(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? movements : movements.filter(m => m.type === filter)

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600/100 dark:text-sky-400/100">รับ/จ่ายสินค้า</h1>
          <p className="text-gray-500 mt-1">ประวัติการเคลื่อนไหวสินค้าทั้งหมด</p>
        </div>
        <Link
          href="/movements/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          บันทึกรับ/จ่าย
        </Link>
      </div>

      <div className="flex gap-2">
        {(['all', 'in', 'out'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'all' ? 'ทั้งหมด' : t === 'in' ? 'รับสินค้า' : 'จ่ายสินค้า'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
          <ArrowLeftRight size={40} />
          <p>ไม่มีรายการ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ประเภท</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">สินค้า</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">จำนวน</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">หมายเหตุ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่/เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.type === 'in' ? (
                        <ArrowDownCircle size={16} className="text-green-500" />
                      ) : (
                        <ArrowUpCircle size={16} className="text-red-500" />
                      )}
                      <span className={`font-medium ${m.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                        {m.type === 'in' ? 'รับสินค้า' : 'จ่ายสินค้า'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${m.product_id}`} className="font-medium text-blue-600/100 dark:text-sky-400/100 hover:text-blue-600">
                      {m.products?.name}
                    </Link>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'in' ? '+' : '-'}{m.quantity} {m.products?.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.note ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleString('th-TH')}
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
