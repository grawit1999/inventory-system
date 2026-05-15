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

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>กำลังโหลด...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>รับ/จ่ายทรัพยากร</h1>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>ประวัติการเคลื่อนไหวทรัพยากรทั้งหมด</p>
        </div>
        <Link
          href="/movements/new"
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--primary)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}
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
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={
              filter === t
                ? { background: 'var(--primary)', color: '#fff' }
                : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }
            }
          >
            {t === 'all' ? 'ทั้งหมด' : t === 'in' ? 'รับทรัพยากร' : 'จ่ายทรัพยากร'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: 'var(--muted)' }}>
          <ArrowLeftRight size={40} />
          <p>ไม่มีรายการ</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>ประเภท</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>ทรัพยากร</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>จำนวน</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>ผู้เบิก</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>หมายเหตุ</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>วันที่/เวลา</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--background)')}
                  onMouseOut={e => (e.currentTarget.style.background = '')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.type === 'in' ? (
                        <ArrowDownCircle size={16} className="text-green-500" />
                      ) : (
                        <ArrowUpCircle size={16} className="text-red-500" />
                      )}
                      <span className={`font-medium ${m.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                        {m.type === 'in' ? 'รับทรัพยากร' : 'จ่ายทรัพยากร'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${m.product_id}`} className="font-medium" style={{ color: 'var(--primary)' }}>
                      {m.products?.name}
                    </Link>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'in' ? '+' : '-'}{m.quantity} {m.products?.unit}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{m.requester ?? '-'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{m.note ?? '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
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
