import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase, type ProviderProfileInsert } from '@/lib/supabase'

export function ProviderSetupPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createProfile = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('You must be logged in')

      const { error: insertError } = await supabase.from('provider_profiles').insert({
        user_id: profile.id,
        business_name: businessName.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        phone: phone.trim() || null,
      } satisfies ProviderProfileInsert)

      if (insertError) throw insertError
    },
    onSuccess: () => {
      navigate('/provider')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    createProfile.mutate()
  }

  return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Set up your provider store</CardTitle>
            <CardDescription>
              Tell clients about your business. You can update this information later.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="business_name">Business name *</Label>
                <Input
                    id="business_name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Services"
                    required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your services and expertise..."
                    rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                  type="submit"
                  className="w-full"
                  disabled={createProfile.isPending || !businessName.trim()}
              >
                {createProfile.isPending ? 'Creating store...' : 'Create store'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}