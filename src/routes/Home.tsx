import { LayoutDashboard } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Empty } from '../components/ui/Empty'
import { APP_NAME } from '../lib/app'

export default function Home() {
  return (
    <>
      <PageHeader title="Tổng quan" subtitle={APP_NAME} />
      <Empty
        icon={LayoutDashboard}
        title="Chưa có dữ liệu"
        hint="Màn hình này sẽ hiển thị số liệu chính sau khi nạp dữ liệu đề."
      />
    </>
  )
}
