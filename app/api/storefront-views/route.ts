import { createHmac } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|googlebot|semrush|ahrefs/i

const DEDUPE_WINDOW_HOURS = 24

function hashVisitor(ip: string, dayBucket: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createHmac('sha256', salt).update(`${ip}:${dayBucket}`).digest('hex')
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? ''
  if (BOT_UA_PATTERN.test(userAgent)) {
    return NextResponse.json({ recorded: false })
  }

  let providerId: unknown
  try {
    const body = await request.json()
    providerId = body.providerId
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (typeof providerId !== 'string' || !providerId) {
    return NextResponse.json({ error: 'Missing providerId' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const dayBucket = new Date().toISOString().slice(0, 10)
  const viewerHash = hashVisitor(ip, dayBucket)

  const supabase = createServiceClient()

  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase
    .from('storefront_views')
    .select('id')
    .eq('provider_id', providerId)
    .eq('viewer_hash', viewerHash)
    .gte('viewed_at', since)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ recorded: false })
  }

  const { error } = await supabase
    .from('storefront_views')
    .insert({ provider_id: providerId, viewer_hash: viewerHash })

  if (error) {
    console.error('Failed to record storefront view:', error.message)
    return NextResponse.json({ recorded: false })
  }

  return NextResponse.json({ recorded: true })
}
