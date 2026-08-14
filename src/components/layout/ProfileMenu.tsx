'use client'

import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import { ChevronDown, LayoutDashboard, LifeBuoy, LogOut, Settings, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'

interface ProfileMenuProps {
  email: string
  hasProviderProfile: boolean
  onSignOut: () => void
  dark?: boolean
}

const itemClass =
  'flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-black outline-none transition-colors data-[highlighted]:bg-black data-[highlighted]:text-white cursor-pointer'

export function ProfileMenu({ email, hasProviderProfile, onSignOut, dark = false }: ProfileMenuProps) {
  const router = useRouter()
  const { activeStep } = useOnboarding()
  const [open, setOpen] = useState(false)

  // Let the tour reveal this menu's contents when it needs to spotlight
  // something inside it, without the tour engine knowing anything about
  // dropdowns — this component just opts in by step id.
  const tourWantsOpen = activeStep?.id === 'settings' || activeStep?.id === 'help'

  return (
    <DropdownMenu.Root open={open || tourWantsOpen} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          data-tour="profile-menu"
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium tracking-wide outline-none',
            dark ? 'text-white/70 hover:text-white' : 'text-black/60 hover:text-black',
          )}
        >
          <span className="hidden max-w-[10rem] truncate lg:inline">{email}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-56 border border-black bg-white py-1.5 shadow-xl animate-tour-scale-in"
        >
          <DropdownMenu.Item className={itemClass} onSelect={() => router.push('/dashboard')}>
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </DropdownMenu.Item>

          {hasProviderProfile && (
            <DropdownMenu.Item className={itemClass} onSelect={() => router.push('/provider')}>
              <Store className="h-3.5 w-3.5" />
              Provider Dashboard
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item
            className={itemClass}
            data-tour="settings-link"
            onSelect={() => router.push('/settings')}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Item className={itemClass} data-tour="help-link" onSelect={() => router.push('/help')}>
            <LifeBuoy className="h-3.5 w-3.5" />
            Help & Support
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1.5 h-px bg-black/10" />

          <DropdownMenu.Item className={itemClass} onSelect={onSignOut}>
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
