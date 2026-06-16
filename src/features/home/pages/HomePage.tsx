import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Shield, Star, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/useAuth'

const features = [
  {
    icon: Store,
    title: 'Browse providers',
    description: 'Discover trusted service providers in your area.',
  },
  {
    icon: Calendar,
    title: 'Book services',
    description: 'Schedule appointments with a seamless booking flow.',
  },
  {
    icon: Star,
    title: 'Leave reviews',
    description: 'Share feedback to help the community find quality services.',
  },
  {
    icon: Shield,
    title: 'Built-in support',
    description: 'Internal support team ready to help when you need it.',
  },
]

export function HomePage() {
  const { session, profile } = useAuth()

  const dashboardPath = profile
    ? profile.role === 'provider'
      ? '/provider'
      : profile.role.startsWith('support_')
        ? '/support'
        : '/client'
    : '/signup'

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-3xl space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          The marketplace for trusted local services
        </h1>
        <p className="text-lg text-muted-foreground">
          TopDeck connects clients with service providers — book services, manage your business,
          and get support all in one platform.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {session ? (
            <Button size="lg" asChild>
              <Link to={dashboardPath}>
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/signup">Get started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  )
}
