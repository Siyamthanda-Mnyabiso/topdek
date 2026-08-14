import { PaddedShell } from '@/components/layout/PaddedShell'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PaddedShell>{children}</PaddedShell>
}
