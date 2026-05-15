import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export const supabase = {
  from: (...args: Parameters<ReturnType<typeof getSupabase>['from']>) => getSupabase().from(...args),
}

export type Category = {
  id: string
  name: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  sku: string | null
  category_id: string | null
  unit: string
  price: number
  current_stock: number
  min_stock: number
  description: string | null
  created_at: string
  updated_at: string
  categories?: Category
}

export type StockMovement = {
  id: string
  product_id: string
  type: 'in' | 'out'
  quantity: number
  note: string | null
  requester: string | null
  created_at: string
  products?: Product
}

export type Member = {
  id: string
  name: string
  role: string
  created_at: string
}
