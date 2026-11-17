import { Clock } from 'lucide-react'
import { Empty } from './Empty'

export function ComingSoon({ hint }: { hint?: string }) {
  return <Empty icon={Clock} title="Có ở bản tiếp theo" hint={hint} />
}
