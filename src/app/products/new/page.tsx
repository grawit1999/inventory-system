'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    unit: 'ชิ้น',
    current_stock: '0',
    min_stock: '0',
    description: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('products').insert({
      name: form.name.trim(),
      unit: form.unit.trim(),
      current_stock: parseInt(form.current_stock) || 0,
      min_stock: parseInt(form.min_stock) || 0,
      description: form.description.trim() || null,
    })
    setSaving(false)
    if (!error) router.push('/products')
    else alert('เกิดข้อผิดพลาด: ' + error.message)
  }

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const inputStyle = { border: '1px solid var(--border)', background: 'var(--card)' }
  const labelClass = "block text-sm font-medium mb-1"
  const labelStyle = { color: 'var(--foreground)' }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/products" className="transition-colors" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>เพิ่มทรัพยากรใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>ชื่อทรัพยากร <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              className={inputClass} style={inputStyle}
              placeholder="ชื่อทรัพยากร" />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>หน่วย <span className="text-red-500">*</span></label>
            <input required value={form.unit} onChange={e => set('unit', e.target.value)}
              className={inputClass} style={inputStyle}
              placeholder="ชิ้น / กล่อง / กก." />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>จำนวนเริ่มต้น</label>
            <input type="number" min="0" value={form.current_stock} onChange={e => set('current_stock', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>สต็อกขั้นต่ำ</label>
            <input type="number" min="0" value={form.min_stock} onChange={e => set('min_stock', e.target.value)}
              className={inputClass} style={inputStyle}
              placeholder="สำหรับแจ้งเตือนสต็อกต่ำ" />
          </div>
          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>รายละเอียด</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className={`${inputClass} resize-none`} style={inputStyle}
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: saving ? 'var(--muted)' : 'var(--primary)' }}
            onMouseOver={e => { if (!saving) e.currentTarget.style.background = 'var(--primary-hover)' }}
            onMouseOut={e => { if (!saving) e.currentTarget.style.background = 'var(--primary)' }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกทรัพยากร'}
          </button>
          <Link href="/products"
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors text-center"
            style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
