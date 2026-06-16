import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Building2, Package, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { ProviderProfile } from '@/types/database'

export function ProviderDashboardPage() {
  const { profile } = useAuth()

  const { data: providerProfile, isLoading } = useQuery({
    queryKey: ['provider-profile', profile?.id],
    queryFn: async (): Promise<ProviderProfile | null> => {
      if (!profile) return null

      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle()

      if (error) throw error
      return data as ProviderProfile | null
    },
    enabled: !!profile,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading your store...</p>
      </div>
    )
  }

  if (!providerProfile) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Set up your store</h1>
          <p className="mt-2 text-muted-foreground">
            Create your provider profile to start offering services on TopDeck.
          </p>
        </div>
        <Button asChild>
          <Link to="/provider/setup">Complete onboarding</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{providerProfile.business_name}</h1>
          <p className="mt-2 text-muted-foreground">Manage your store, services, and bookings.</p>
        </div>
        <Badge variant="secondary">Provider</Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Building2 className="mb-2 h-6 w-6" />
            <CardTitle>Store profile</CardTitle>
            <CardDescription>Your public business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {providerProfile.location && (
              <p>
                <span className="text-muted-foreground">Location:</span> {providerProfile.location}
              </p>
            )}
            {providerProfile.phone && (
              <p>
                <span className="text-muted-foreground">Phone:</span> {providerProfile.phone}
              </p>
            )}
            {providerProfile.description && (
              <p className="text-muted-foreground">{providerProfile.description}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Package className="mb-2 h-6 w-6" />
            <CardTitle>Services</CardTitle>
            <CardDescription>Manage your service offerings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Service management coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Settings className="mb-2 h-6 w-6" />
            <CardTitle>Settings</CardTitle>
            <CardDescription>Profile and subscription settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Store visibility requires an active subscription (future feature).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
