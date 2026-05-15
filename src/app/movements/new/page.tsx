'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Product, Member } from '@/lib/supabase'
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

function NewMovementForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProduct = searchParams.get('product') ?? ''

  const [products, setProducts] = useState<Product[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    product_id: preselectedProduct,
    type: 'in' as 'in' | 'out',
    quantity: '',
    note: '',
    requester: '',
  })

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('members').select('*').order('name'),
    ]).then(([{ data: prods }, { data: mems }]) => {
      const prodList = prods ?? []
      setProducts(prodList)
      setMembers(mems ?? [])
      if (preselectedProduct) {
        setSelectedProduct(prodList.find(p => p.id === preselectedProduct) ?? null)
      }
    })
  }, [preselectedProduct])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function handleProductChange(id: string) {
    set('product_id', id)
    setSelectedProduct(products.find(p => p.id === id) ?? null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_id) return
    const qty = parseInt(form.quantity)
    if (!qty || qty <= 0) return alert('จำนวนต้องมากกว่า 0')

    if (form.type === 'out' && selectedProduct && qty > selectedProduct.current_stock) {
      return alert(`สต็อกไม่พอ (คงเหลือ: ${selectedProduct.current_stock} ${selectedProduct.unit})`)
    }

    setSaving(true)
    const { error } = await supabase.from('stock_movements').insert({
      product_id: form.product_id,
      type: form.type,
      quantity: qty,
      note: form.note.trim() || null,
      requester: form.type === 'out' ? (form.requester.trim() || null) : null,
    })
    setSaving(false)
    if (!error) router.push('/movements')
    else alert('เกิดข้อผิดพลาด: ' + error.message)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/movements" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">บันทึกรับ/จ่ายสินค้า</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {(['in', 'out'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'in'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {t === 'in' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                {t === 'in' ? 'รับสินค้า' : 'จ่ายสินค้า'}
              </button>
            ))}
          </div>
        </div>

        {/* Product selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">สินค้า <span className="text-red-500">*</span></label>
          <select
            required
            value={form.product_id}
            onChange={e => handleProductChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- เลือกสินค้า --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (คงเหลือ: {p.current_stock} {p.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            จำนวน {selectedProduct && `(${selectedProduct.unit})`} <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="number"
            min="1"
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          {form.type === 'out' && selectedProduct && (
            <p className="text-xs text-gray-400 mt-1">คงเหลือ: {selectedProduct.current_stock} {selectedProduct.unit}</p>
          )}
        </div>

        {/* Requester — แสดงเฉพาะตอนจ่ายสินค้า */}
        {form.type === 'out' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้เบิก</label>
            {members.length > 0 ? (
              <select
                value={form.requester}
                onChange={e => set('requester', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- เลือกผู้เบิก --</option>
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            ) : (
              <input
                value={form.requester}
                onChange={e => set('requester', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชื่อผู้เบิก"
              />
            )}
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
          <input
            value={form.note}
            onChange={e => set('note', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น ซื้อจากผู้จัดส่ง / ขายลูกค้า"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              form.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {saving ? 'กำลังบันทึก...' : form.type === 'in' ? 'บันทึกรับสินค้า' : 'บันทึกจ่ายสินค้า'}
          </button>
          <Link href="/movements"
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors text-center">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function NewMovementPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>}>
      <NewMovementForm />
    </Suspense>
  )
}
