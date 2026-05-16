'use client'
import { useEffect, useState } from 'react'
import { supabase, Member } from '@/lib/supabase'
import { Plus, Trash2, Users, Pencil, X, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function MembersPage() {
  const { isLoggedIn } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [form, setForm] = useState({ name: '', role: '' })

  useEffect(() => {
    supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMembers(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('members')
      .insert({ name: form.name.trim(), role: form.role.trim() || 'สมาชิก' })
      .select()
      .single()
    setSaving(false)
    if (!error && data) {
      setMembers(prev => [...prev, data])
      setForm({ name: '', role: '' })
      setShowForm(false)
    } else {
      alert('เกิดข้อผิดพลาด: ' + error?.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบสมาชิกนี้?')) return
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (!error) setMembers(prev => prev.filter(m => m.id !== id))
  }

  async function handleEdit(id: string) {
    const { error } = await supabase
      .from('members')
      .update({ name: editName.trim(), role: editRole.trim() })
      .eq('id', id)
    if (!error) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, name: editName.trim(), role: editRole.trim() } : m))
      setEditId(null)
    } else {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    }
  }

  function startEdit(m: Member) {
    setEditId(m.id)
    setEditName(m.name)
    setEditRole(m.role)
  }

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const inputStyle = { border: '1px solid var(--border)', background: 'var(--card)' }

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>กำลังโหลด...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>สมาชิก</h1>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>{members.length} คน</p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 text-white px-3 py-2.5 sm:px-4 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--primary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">เพิ่มสมาชิก</span>
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="font-medium text-sm" style={{ color: 'var(--primary)' }}>เพิ่มสมาชิกใหม่</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>ชื่อ <span className="text-red-500">*</span></label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputClass} style={inputStyle}
                placeholder="ชื่อ-นามสกุล"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>ตำแหน่ง</label>
              <input
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className={inputClass} style={inputStyle}
                placeholder="เช่น หัวหน้า, สมาชิก"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: 'var(--primary)' }}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}

      {/* Member list */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: 'var(--muted)' }}>
          <Users size={40} />
          <p>ยังไม่มีสมาชิก</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {members.map((m, i) => (
            <div key={m.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors"
              style={{ borderBottom: i < members.length - 1 ? '1px solid var(--border)' : undefined }}>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                style={{ background: 'var(--primary)' }}>
                {m.name.charAt(0)}
              </div>

              {/* Name / role — editable */}
              {editId === m.id ? (
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="flex-1 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-0"
                    style={{ border: '1px solid var(--border)', background: 'var(--background)' }} />
                  <input value={editRole} onChange={e => setEditRole(e.target.value)}
                    className="w-28 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ border: '1px solid var(--border)', background: 'var(--background)' }} />
                  <button onClick={() => handleEdit(m.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><Check size={15} /></button>
                  <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><X size={15} /></button>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--foreground)' }}>{m.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{m.role || 'สมาชิก'}</p>
                </div>
              )}

              {/* Actions */}
              {isLoggedIn && editId !== m.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors" style={{ color: 'var(--muted)' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
