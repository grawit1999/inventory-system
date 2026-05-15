'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, StockMovement } from '@/lib/supabase'
import { Plus, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Trash2 } from 'lucide-react'

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

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบรายการนี้?')) return
    const { error } = await supabase.from('stock_movements').delete().eq('id', id)
    if (!error) setMovements(prev => prev.filter(m => m.id !== id))
  }

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
          className="flex items-center gap-2 text-white px-3 py-2.5 sm:px-4 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--primary)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">บันทึกรับ/จ่าย</span>
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
        <>
          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {filtered.map(m => (
              <div key={m.id} className="p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {m.type === 'in' ? (
                      <ArrowDownCircle size={18} className="text-green-500 shrink-0" />
                    ) : (
                      <ArrowUpCircle size={18} className="text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <Link href={`/products/${m.product_id}`} className="font-medium text-sm truncate block" style={{ color: 'var(--primary)' }}>
                        {m.products?.name}
                      </Link>
                      <span className={`text-xs font-medium ${m.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                        {m.type === 'in' ? 'รับทรัพยากร' : 'จ่ายทรัพยากร'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.type === 'in' ? '+' : '-'}{m.quantity} {m.products?.unit}
                    </span>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--muted)' }}>
                  {m.requester && <span>ผู้เบิก: {m.requester}</span>}
                  {m.note && <span>หมายเหตุ: {m.note}</span>}
                  <span>{new Date(m.created_at).toLocaleString('th-TH')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-x-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>ประเภท</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>ทรัพยากร</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>จำนวน</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>ผู้เบิก</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>หมายเหตุ</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>วันที่/เวลา</th>
                  <th className="px-4 py-3"></th>
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
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                      </button>
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
