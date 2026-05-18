'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Package, ArrowLeftRight, LayoutDashboard, Users, LogIn, LogOut, Lock } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'

const navItems = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/products', label: 'ทรัพยากร', icon: Package },
  { href: '/movements', label: 'รับ/จ่าย', icon: ArrowLeftRight },
  { href: '/members', label: 'สมาชิก', icon: Users },
]

export default function Navbar() {
  const pathname = usePathname()
  const { isLoggedIn, login, logout } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const ok = login(password)
    if (ok) {
      setShowModal(false)
      setPassword('')
      setError(false)
    } else {
      setError(true)
    }
  }

  function handleLogout() {
    logout()
  }

  return (
    <>
      {/* Top navbar */}
      <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/Logo_JZ.png" alt="JOMZON Logo" width={40} height={40} className="rounded-lg object-contain" />
              <span className="font-bold text-base md:text-lg" style={{ color: 'var(--primary)' }}>JOMZON</span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                  return (
                    <Link
                      key={href}
                      href={href}
                      style={active
                        ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                        : { color: 'var(--muted)' }
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  )
                })}
              </div>

              {/* Login / Logout button */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                  title="ออกจากระบบ"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              ) : (
                <button
                  onClick={() => { setShowModal(true); setError(false); setPassword('') }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: 'var(--primary)' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}
                >
                  <LogIn size={15} />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom tab bar — mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors"
              style={active ? { color: 'var(--primary)' } : { color: 'var(--muted)' }}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer for bottom tab */}
      <div className="md:hidden h-14" aria-hidden="true" />

      {/* Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex flex-col items-center gap-2 pb-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                <Lock size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>เข้าสู่ระบบ</h2>
              <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>กรอกรหัสผ่านเพื่อเพิ่ม/แก้ไข/ลบข้อมูล</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                style={{ border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`, background: 'var(--background)' }}
                placeholder="รหัสผ่าน"
                autoFocus
              />
              {error && <p className="text-xs text-red-500">รหัสผ่านไม่ถูกต้อง</p>}
              <button type="submit"
                className="w-full text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--primary)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}>
                เข้าสู่ระบบ
              </button>
              <button type="button" onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
                ยกเลิก
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
