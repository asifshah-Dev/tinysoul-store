// app/contact/page.tsx
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Tiny Soul',
};

const PALETTE = {
  cream: '#FDF6E3',
  creamDeep: '#F5E6C8',
  teal: '#0F766E',
  tealSoft: '#E6F4F1',
  coral: '#F4713A',
  ink: '#1c130d',
  muted: '#6f6248',
  mutedLight: '#948362',
};

export default function ContactPage() {
  return (
    <main
      className="min-h-screen pt-20 md:pt-24"
      style={{ backgroundColor: PALETTE.cream }}
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: PALETTE.teal }}
          >
            Get in Touch
          </h1>
          <p
            className="mt-3 text-lg"
            style={{ color: PALETTE.muted }}
          >
            We&apos;d love to hear from you. Reach out anytime.
          </p>
        </div>

        <div className="grid gap-6">
          {/* WhatsApp */}
          <a
            href="https://wa.me/923024380139"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-md group"
            style={{
              backgroundColor: PALETTE.cream,
              borderColor: PALETTE.creamDeep,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#DCFCE7' }}
            >
              <MessageCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3
                className="font-semibold transition-colors group-hover:opacity-80"
                style={{ color: PALETTE.ink }}
              >
                WhatsApp
              </h3>
              <p className="text-sm" style={{ color: PALETTE.muted }}>
                +92 302 4380139
              </p>
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+923024380139"
            className="flex items-center gap-4 p-6 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-md group"
            style={{
              backgroundColor: PALETTE.cream,
              borderColor: PALETTE.creamDeep,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: PALETTE.tealSoft }}
            >
              <Phone
                className="w-7 h-7"
                style={{ color: PALETTE.teal }}
              />
            </div>
            <div>
              <h3
                className="font-semibold transition-colors group-hover:opacity-80"
                style={{ color: PALETTE.ink }}
              >
                Phone
              </h3>
              <p className="text-sm" style={{ color: PALETTE.muted }}>
                +92 302 4380139
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:info@tinysoul.pk"
            className="flex items-center gap-4 p-6 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-md group"
            style={{
              backgroundColor: PALETTE.cream,
              borderColor: PALETTE.creamDeep,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#E0F2FE' }}
            >
              <Mail className="w-7 h-7 text-sky-600" />
            </div>
            <div>
              <h3
                className="font-semibold transition-colors group-hover:opacity-80"
                style={{ color: PALETTE.ink }}
              >
                Email
              </h3>
              <p className="text-sm" style={{ color: PALETTE.muted }}>
                info@tinysoul.pk
              </p>
            </div>
          </a>

          {/* Address */}
          <div
            className="flex items-center gap-4 p-6 rounded-2xl border"
            style={{
              backgroundColor: PALETTE.cream,
              borderColor: PALETTE.creamDeep,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFE4E6' }}
            >
              <MapPin className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: PALETTE.ink }}>
                Location
              </h3>
              <p className="text-sm" style={{ color: PALETTE.muted }}>
                Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div
          className="mt-12 p-6 rounded-2xl border text-center"
          style={{
            backgroundColor: PALETTE.tealSoft,
            borderColor: '#B8E0D9',
          }}
        >
          <p style={{ color: PALETTE.teal }}>
            For order inquiries, please have your order details ready when you contact us.
          </p>
        </div>
      </div>
    </main>
  );
}