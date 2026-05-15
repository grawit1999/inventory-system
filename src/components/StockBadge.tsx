type Props = {
  current: number
  min: number
}

export default function StockBadge({ current, min }: Props) {
  if (current === 0) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">หมด</span>
  }
  if (current <= min) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">ใกล้หมด</span>
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">ปกติ</span>
}
