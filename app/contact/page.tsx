// app/contact/page.tsx
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Tiny Soul',
};

export default function ContactPage() {
  return (
    <main className="pt-24 md:pt-28">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-700 tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            We'd love to hear from you. Reach out anytime.
          </p>
        </div>

        <div className="grid gap-6">
          {/* WhatsApp */}
          <a
            href="https://wa.me/923024380139"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-teal-300 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                WhatsApp
              </h3>
              <p className="text-sm text-gray-500">+92 302 4380139</p>
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+923024380139"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-teal-300 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                Phone
              </h3>
              <p className="text-sm text-gray-500">+92 302 4380139</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:info@tinysoul.pk"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-teal-300 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                Email
              </h3>
              <p className="text-sm text-gray-500">info@tinysoul.pk</p>
            </div>
          </a>

          {/* Address */}
          <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Location</h3>
              <p className="text-sm text-gray-500">Pakistan</p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-teal-50 rounded-2xl border border-teal-100 text-center">
          <p className="text-teal-800">
            For order inquiries, please have your order details ready when you contact us.
          </p>
        </div>
      </div>
    </main>
  );
}