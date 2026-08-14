import type { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help & Support — TopDek',
  description: 'Answers to common questions about booking, becoming a provider, and managing bookings on TopDek.',
  alternates: { canonical: '/help' },
}

const FAQS = [
  {
    question: 'How do I book a service?',
    answer:
      'Browse professionals from the Professionals page, open a provider\'s profile, pick a service, then choose an available date and time. The provider will confirm your request.',
  },
  {
    question: 'How do I become a provider?',
    answer:
      'Open your dashboard and click "Create Store" under Your Store. Once your store is set up, you can add services and start accepting bookings — it\'s free.',
  },
  {
    question: 'Will I be notified about my bookings?',
    answer:
      'Yes — enable notifications from the bell icon in the navbar and you\'ll get updates in-app and as push notifications, even when TopDek is closed.',
  },
  {
    question: 'Can I save providers for later?',
    answer:
      'Tap the heart icon on any provider\'s profile or card to save them. They\'ll show up under Saved Providers on your dashboard.',
  },
  {
    question: 'How do I cancel or reschedule a booking?',
    answer:
      'Clients can view booking status on My Bookings. Providers can accept, decline, complete, or reschedule requests from Provider Dashboard → Bookings.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">HELP & SUPPORT</h1>
        <p className="mt-3 text-sm text-black/50">Answers to common questions, and how to reach us.</p>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-12 max-w-2xl space-y-12">
        <section>
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-4">FAQ</h2>
          <div className="divide-y divide-black/10 border border-black">
            {FAQS.map((faq) => (
              <div key={faq.question} className="p-6">
                <h3 className="font-black uppercase tracking-tight text-sm">{faq.question}</h3>
                <p className="mt-2 text-sm text-black/60">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-4">
            Still need help?
          </h2>
          <a
            href="mailto:support@topdek.co.za"
            className="flex items-center justify-between gap-4 border border-black p-6 transition-colors hover:bg-black hover:text-white group"
          >
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-black uppercase tracking-tight">Email support</h3>
                <p className="text-xs text-black/40 group-hover:text-white/60 mt-0.5">
                  support@topdek.co.za
                </p>
              </div>
            </div>
          </a>
        </section>
      </div>
    </div>
  )
}
