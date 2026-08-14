import { PaddedShell } from '@/components/layout/PaddedShell'

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return <PaddedShell>{children}</PaddedShell>
}
