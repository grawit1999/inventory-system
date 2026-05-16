'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Package, ArrowLeftRight, LayoutDashboard, Users } from 'lucide-react'

const navItems = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/products', label: 'ทรัพยากร', icon: Package },
  { href: '/movements', label: 'รับ/จ่าย', icon: ArrowLeftRight },
  { href: '/members', label: 'สมาชิก', icon: Users },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Top navbar — visible on all screen sizes */}
      <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/Logo_JZ.png" alt="JOMZON Logo" width={40} height={40} className="rounded-lg object-contain" />
              <span className="font-bold text-base md:text-lg" style={{ color: 'var(--primary)' }}>คลัง JOMZON</span>
            </Link>
            {/* Desktop nav links — hidden on mobile */}
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
          </div>
        </div>
      </nav>

      {/* Bottom tab bar — visible only on mobile */}
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

      {/* Spacer so content doesn't hide behind the bottom tab bar on mobile */}
      <div className="md:hidden h-14" aria-hidden="true" />
    </>
  )
}
