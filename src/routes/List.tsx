import { ListChecks } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Empty } from '../components/ui/Empty'

export default function List() {
  return (
    <>
      <PageHeader title="Danh sách" />
      <Empty icon={ListChecks} title="Danh sách trống" hint="Các mục sẽ xuất hiện ở đây." />
    </>
  )
}
