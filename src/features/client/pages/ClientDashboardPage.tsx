import { Heart, Search, Store } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Link } from 'react-router-dom'

export function ClientDashboardPage() {
  const { profile } = useAuth()

  return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back{profile ? `, ${profile.email}` : ''}. Browse providers, save favorites,
            and manage your services.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Search className="mb-2 h-6 w-6" />
              <CardTitle>Browse providers</CardTitle>
              <CardDescription>Explore service providers on the marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon — provider directory.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="mb-2 h-6 w-6" />
              <CardTitle>Saved providers</CardTitle>
              <CardDescription>Quick access to your favorite providers.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No saved providers yet.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Store className="mb-2 h-6 w-6" />
              <CardTitle>Your store</CardTitle>
              <CardDescription>Offer your services on the marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link to="/provider/setup">Create your store</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}