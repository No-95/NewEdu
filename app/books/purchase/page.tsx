'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';

type FormState = {
  fullName: string;
  phone: string;
  address: string;
  note: string;
};

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  address: '',
  note: '',
};

export default function BooksPurchasePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/books/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Gửi đơn thất bại. Vui lòng thử lại sau.');
      }

      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi đơn thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />
      <ParticleBackground />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 pt-24 sm:px-8">
        <section className="glass rounded-3xl border border-border/60 p-8 shadow-2xl sm:p-10">
          <p className="inline-flex rounded-full border border-red-700/30 bg-red-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
            Đặt mua sách
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Thông tin nhận sách</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Điền thông tin giao hàng; HDP EDU sẽ liên hệ xác nhận đơn và giao sách đến bạn.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-200">
              Đăng ký mua sách thành công. Chúng tôi sẽ liên hệ bạn sớm để xác nhận và giao hàng.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                Họ và tên
              </label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Nhập họ và tên"
                autoComplete="name"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Nhập số điện thoại"
                autoComplete="tel"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-medium">
                Địa chỉ nhận hàng
              </label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Nhập địa chỉ nhận hàng chi tiết"
                autoComplete="street-address"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="note" className="mb-2 block text-sm font-medium">
                Ghi chú cho shipper (tùy chọn)
              </label>
              <textarea
                id="note"
                rows={3}
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Ví dụ: gọi trước khi giao, giao trong giờ hành chính..."
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt mua'}
              </button>
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-card/70 px-6 py-3 text-sm font-semibold text-foreground hover:bg-card"
              >
                Quay lại trang sách
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
