'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function PreviewTestimonialsPage() {
  const { language, setLanguage } = useLanguage();

  // Trang xem trước: mặc định tiếng Việt để duyệt đúng nội dung sẽ công khai.
  useEffect(() => {
    if (language !== 'vi') {
      setLanguage('vi');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-24">
        <div className="mb-10 rounded-2xl border border-amber-300/40 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          <p className="font-semibold">Trang xem trước nội bộ — chưa áp dụng vào trang thật.</p>
          <p className="mt-1 text-amber-100/80">
            Bản carousel: mỗi đánh giá là một thẻ trượt ngang, có mũi tên và chấm chỉ trang. Nội
            dung testimonial là bản nháp mẫu để duyệt bố cục và thẩm mỹ; tên và câu trích dẫn sẽ
            được thay bằng phản hồi thật trước khi công khai.
          </p>
        </div>

        {/* Biến thể 1 — khối lớn cho trang chủ */}
        <section className="mb-16">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Biến thể A
            </span>
            <h2 className="text-lg font-bold text-foreground">Khối lớn — dùng cho trang chủ</h2>
          </div>
          <TestimonialsSection variant="page" />
        </section>

        {/* Biến thể 2 — gọn, dùng cho trang khoá học */}
        <section className="rounded-3xl border border-white/10 bg-card/30 p-6 backdrop-blur-md md:p-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Biến thể B
            </span>
            <h2 className="text-lg font-bold text-foreground">Khối gọn — dùng cho trang khoá học</h2>
          </div>
          <TestimonialsSection variant="inline" />
        </section>
      </main>
    </div>
  );
}
