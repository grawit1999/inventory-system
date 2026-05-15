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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            <span className="font-bold text-blue-600/100 dark:text-sky-400/100 text-lg">คลังสินค้า</span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600/100 dark:text-sky-400/100'
                  }`}
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
