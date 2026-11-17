import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { ComingSoon } from '../../components/ui/ComingSoon'
import { SampleLoadBlock } from '../../components/SampleLoadBlock'
import { useStore } from '../../store/AppStore'

/** Phía Thành viên — phase 2 làm chi tiết. Route nhận ?ma=KT-xxx để mở đúng thẻ. */
function useMemberParam(): string {
  const [params] = useSearchParams()
  return (params.get('ma') ?? '').trim().toUpperCase()
}

export function TvThe() {
  const { hasData } = useStore()
  const ma = useMemberParam()
  return (
    <>
      <PageHeader title="Thẻ của tôi" subtitle={ma || undefined} />
      {hasData ? <ComingSoon hint="Thẻ thành viên đổi màu theo hạng và mã QR." /> : <SampleLoadBlock />}
    </>
  )
}

export function TvUuDai() {
  const ma = useMemberParam()
  return (
    <>
      <PageHeader title="Ưu đãi" subtitle={ma ? `Thẻ ${ma}` : undefined} />
      <ComingSoon hint="Đổi điểm lấy ưu đãi và ví voucher." />
    </>
  )
}

export function TvLichSu() {
  return (
    <>
      <PageHeader title="Lịch sử" />
      <ComingSoon />
    </>
  )
}

export function TvTheLe() {
  return (
    <>
      <PageHeader title="Thể lệ" />
      <ComingSoon />
    </>
  )
}
