import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Building2, Package, Settings, Eye, Clock, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ShareStoreCard } from '@/features/provider/components/ShareStoreCard'

export function ProviderDashboardPage() {
  const { profile } = useAuth()

  const { data: providerProfile, isLoading } = useQuery({
    queryKey: ['provider-profile', profile?.id],
    queryFn: async () => {
      if (!profile) return null
      const { data } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle()
      return data
    },
    enabled: !!profile,
  })

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 border-2 border-black border-t-transparent animate-spin" />
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-white">

        <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
          <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">
            PROVIDER DASHBOARD
          </h1>
          {providerProfile && (
              <p className="mt-3 text-sm text-black/50 uppercase tracking-widest">
                {providerProfile.business_name}
              </p>
          )}
        </div>

        <div data-tour="provider-dashboard-cards" className="px-6 md:px-12 lg:px-20 py-12 space-y-4 max-w-2xl">

          {/* BOOKINGS */}
          <div className="border border-black p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="h-5 w-5" />
              <div>
                <h2 className="font-black uppercase tracking-tight">BOOKINGS</h2>
                <p className="text-xs text-black/40 mt-0.5">Manage client bookings</p>
              </div>
            </div>
            <Link
                to="/provider/bookings"
                className="border border-black px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
            >
              VIEW
            </Link>
          </div>

          {/* AVAILABILITY */}
          <div className="border border-black p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5" />
              <div>
                <h2 className="font-black uppercase tracking-tight">AVAILABILITY</h2>
                <p className="text-xs text-black/40 mt-0.5">Set your working hours</p>
              </div>
            </div>
            <Link
                to="/provider/availability"
                className="border border-black px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
            >
              MANAGE
            </Link>
          </div>

          {/* STORE */}
          <div className="border border-black p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="h-5 w-5" />
              <div>
                <h2 className="font-black uppercase tracking-tight">YOUR STORE</h2>
                <p className="text-xs text-black/40 mt-0.5">
                  {providerProfile ? providerProfile.business_name : 'No store yet'}
                </p>
              </div>
            </div>
            {providerProfile ? (
                <Link
                    to="/provider/store"
                    className="border border-black px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
                >
                  EDIT
                </Link>
            ) : (
                <Link
                    to="/provider/setup"
                    className="border border-black bg-black text-white px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-white hover:text-black"
                >
                  CREATE
                </Link>
            )}
          </div>

          {/* SHARE STORE — QR code + copy link */}
          {providerProfile && <ShareStoreCard providerId={providerProfile.id} />}

          {/* SERVICES */}
          <div className="border border-black p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package className="h-5 w-5" />
              <div>
                <h2 className="font-black uppercase tracking-tight">SERVICES</h2>
                <p className="text-xs text-black/40 mt-0.5">Manage what you offer</p>
              </div>
            </div>
            <Link
                to="/provider/services"
                className="border border-black px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
            >
              MANAGE
            </Link>
          </div>

          {/* PUBLIC PROFILE */}
          {providerProfile && (
              <div className="border border-black p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Eye className="h-5 w-5" />
                  <div>
                    <h2 className="font-black uppercase tracking-tight">PUBLIC PROFILE</h2>
                    <p className="text-xs text-black/40 mt-0.5">See how clients see your store</p>
                  </div>
                </div>
                <Link
                    to={`/professionals/${providerProfile.id}`}
                    className="border border-black px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
                >
                  VIEW
                </Link>
              </div>
          )}

          {/* SETTINGS */}
          <div className="border border-black p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="h-5 w-5" />
              <div>
                <h2 className="font-black uppercase tracking-tight">SETTINGS</h2>
                <p className="text-xs text-black/40 mt-0.5">Account and preferences</p>
              </div>
            </div>
            <Link
                to="/settings"
                className="border border-black px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
            >
              MANAGE
            </Link>
          </div>

        </div>
      </div>
  )
}