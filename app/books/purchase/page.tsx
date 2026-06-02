'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { api } from '@/convex/_generated/api';

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
  const createBookOrder = useMutation(api.bookOrders.createBookOrder);
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
      setError('Vui long nhap day du ho ten, so dien thoai va dia chi giao hang.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createBookOrder({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim() || undefined,
      });

      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch {
      setError('Gui don that bai. Vui long thu lai sau.');
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
            Dat mua sach
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Thong tin nhan sach</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Dien thong tin giao hang, HDP EDU se lien he xac nhan don va giao sach den ban.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-200">
              Dang ky mua sach thanh cong. Chung toi se lien he ban som de xac nhan va giao hang.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                Ho va ten
              </label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Nhap ho va ten"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                So dien thoai
              </label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Nhap so dien thoai"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-medium">
                Dia chi nhan hang
              </label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Nhap dia chi nhan hang chi tiet"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="note" className="mb-2 block text-sm font-medium">
                Ghi chu cho shipper (tuy chon)
              </label>
              <textarea
                id="note"
                rows={3}
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Vi du: goi truoc khi giao, giao gio hanh chinh..."
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
                {isSubmitting ? 'Dang gui...' : 'Xac nhan dat mua'}
              </button>
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-card/70 px-6 py-3 text-sm font-semibold text-foreground hover:bg-card"
              >
                Quay lai trang sach
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
