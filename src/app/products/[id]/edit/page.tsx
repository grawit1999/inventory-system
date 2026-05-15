'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, Category, Product } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', sku: '', category_id: '', unit: '', price: '',
    min_stock: '', description: '',
  })

  useEffect(() => {
    async function load() {
      const [{ data: prod }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single<Product>(),
        supabase.from('categories').select('*').order('name'),
      ])
      if (prod) {
        setForm({
          name: prod.name,
          sku: prod.sku ?? '',
          category_id: prod.category_id ?? '',
          unit: prod.unit,
          price: prod.price.toString(),
          min_stock: prod.min_stock.toString(),
          description: prod.description ?? '',
        })
      }
      setCategories(cats ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('products').update({
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      category_id: form.category_id || null,
      unit: form.unit.trim(),
      price: parseFloat(form.price) || 0,
      min_stock: parseInt(form.min_stock) || 0,
      description: form.description.trim() || null,
    }).eq('id', id)
    setSaving(false)
    if (!error) router.push(`/products/${id}`)
    else alert('เกิดข้อผิดพลาด: ' + error.message)
  }

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>กำลังโหลด...</div>

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const inputStyle = { border: '1px solid var(--border)', background: 'var(--card)' }
  const labelClass = "block text-sm font-medium mb-1"
  const labelStyle = { color: 'var(--foreground)' }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/products/${id}`} className="transition-colors" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>แก้ไขสินค้า</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>ชื่อสินค้า <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>SKU</label>
            <input value={form.sku} onChange={e => set('sku', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>หน่วย <span className="text-red-500">*</span></label>
            <input required value={form.unit} onChange={e => set('unit', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>หมวดหมู่</label>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
              className={inputClass} style={inputStyle}>
              <option value="">-- ไม่ระบุ --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>ราคาต่อหน่วย (฿)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>สต็อกขั้นต่ำ</label>
            <input type="number" min="0" value={form.min_stock} onChange={e => set('min_stock', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>รายละเอียด</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className={`${inputClass} resize-none`} style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: saving ? 'var(--muted)' : 'var(--primary)' }}
            onMouseOver={e => { if (!saving) e.currentTarget.style.background = 'var(--primary-hover)' }}
            onMouseOut={e => { if (!saving) e.currentTarget.style.background = 'var(--primary)' }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </button>
          <Link href={`/products/${id}`}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors text-center"
            style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
