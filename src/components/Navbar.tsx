'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ArrowLeftRight, LayoutDashboard } from 'lucide-react'

const navItems = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/products', label: 'สินค้า', icon: Package },
  { href: '/movements', label: 'รับ/จ่ายสินค้า', icon: ArrowLeftRight },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Package style={{ color: 'var(--primary)' }} size={24} />
            <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>คลังสินค้า</span>
          </div>
          <div className="flex items-center gap-1">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80`}
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
  )
}
