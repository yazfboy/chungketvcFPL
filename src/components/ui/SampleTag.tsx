export function SampleTag({ label = 'Dữ liệu mẫu' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line px-1.5 py-0.5 text-xs font-medium text-muted">
      {label}
    </span>
  )
}
