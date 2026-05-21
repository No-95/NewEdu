'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';

const heroImages = [
  { src: '/books/cover1.png', alt: 'Book cover 1' },
  { src: '/books/cover2.png', alt: 'Book cover 2' },
  { src: '/books/cover3.png', alt: 'Book cover 3' },
  { src: '/books/1.png', alt: 'Book image 1' },
  { src: '/books/2.png', alt: 'Book image 2' },
  { src: '/books/3.png', alt: 'Book image 3' },
];

export default function BooksPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />
      <ParticleBackground />

      <main className="relative z-10 pt-20 pb-16">
        <section id="books-hero" className="min-h-[92vh]">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-12">
            <div className="space-y-5 animate-slide-in-left">
                <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  Sách - "Tiếng Hàn Trong Nhà Máy Sản Xuất"
                </p>
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
                  Cuốn sách thực chiến dành riêng cho môi trường sản xuất
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Giúp bạn hiểu quy trình, thuật ngữ, bối cảnh giao tiếp và tự tin làm việc với quản lý.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Số lượng còn lại</p>
                    <p className="text-2xl font-bold text-primary">Còn đúng 74 cuốn</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Tình trạng đợt in</p>
                    <p className="text-lg font-bold text-amber-300 sm:text-2xl">🔥 Đợt in đầu đang gần hết</p>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <p className="text-muted-foreground line-through">Giá Bìa: 250.000đ</p>
                  <p className="text-3xl font-extrabold text-primary">💰 Giá Bán: 225.000đ</p>
                  <p className="font-semibold text-emerald-300">🎁 Giảm 10% !!!</p>
                </div>

                <Link
                  href="/auth"
                  className="inline-flex w-fit items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.4)] transition hover:scale-[1.02] hover:bg-primary/90"
                >
                  Đăng ký mua sách ngay
                </Link>
            </div>

            <div className="animate-slide-in-right space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-3">
                  <Image
                    src={heroImages[0].src}
                    alt={heroImages[0].alt}
                    width={1200}
                    height={800}
                    className="h-[300px] w-full rounded-xl object-cover sm:h-[380px] lg:h-[420px]"
                    priority
                  />
                  <div className="absolute left-6 top-6 rounded-lg bg-black/55 px-3 py-1 text-sm font-semibold text-white">
                    {heroImages[0].alt}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                  {heroImages.slice(1).map((image, index) => (
                    <div key={image.src} className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-2">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={320}
                        height={240}
                        className="h-24 w-full rounded-lg object-cover transition duration-300 group-hover:scale-105 sm:h-20"
                      />
                      <div className="mt-1 text-[10px] text-muted-foreground sm:mt-2 sm:text-xs">{image.alt}</div>
                      <div className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        #{index + 2}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </section>

        <section id="books-overview" className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10">
            <article className="glass rounded-2xl p-6 sm:p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Giới thiệu</p>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Giới thiệu cuốn sách</h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Tiếng Hàn trong nhà máy sản xuất - Cẩm nang giao tiếp thực chiến cho môi trường công nghiệp Hàn Quốc.
                Trong các nhà máy có vốn đầu tư Hàn Quốc, ngôn ngữ không chỉ để giao tiếp mà còn ảnh hưởng trực tiếp
                đến hiệu suất, an toàn và cơ hội thăng tiến.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                "Tiếng Hàn trong nhà máy sản xuất" được biên soạn nhằm cung cấp hệ thống tiếng Hàn chuyên ngành sản
                xuất sát thực tế, giúp người học sử dụng đúng từ vựng, đúng ngữ cảnh và đúng tình huống công việc.
              </p>
              <div className="mt-6 h-px bg-border/60" />

              <h3 className="mt-6 mb-4 text-xl font-bold">Nội dung trọng tâm</h3>
              <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:text-base">
                <li>PPC, IQC, Dập kim loại, Ép nhựa - Khuôn, SMT, Sơn - Phủ bề mặt</li>
                <li>Lắp ráp, QC công đoạn, Bảo trì, Automation</li>
                <li>Kỹ thuật sản phẩm, Kỹ thuật công đoạn, R&amp;D, OQC...</li>
              </ul>

              <div className="mt-6 h-px bg-border/60" />

              <h3 className="mt-6 mb-4 text-xl font-bold">Phù hợp với</h3>
              <ul className="space-y-2 text-sm text-muted-foreground sm:text-base">
                <li>Người lao động tại nhà máy Hàn Quốc</li>
                <li>Kỹ thuật viên, QA - QC, tổ trưởng, quản lý sản xuất</li>
                <li>Sinh viên khối kỹ thuật, ứng viên phỏng vấn công ty Hàn</li>
              </ul>

              <div className="mt-6 h-px bg-border/60" />

              <h3 className="mt-6 mb-4 text-xl font-bold">Giá trị mang lại</h3>
              <ul className="space-y-2 text-sm text-muted-foreground sm:text-base">
                <li>Giao tiếp chính xác trong môi trường sản xuất</li>
                <li>Tự tin làm việc với quản lý người Hàn</li>
                <li>Hạn chế sai sót do hiểu nhầm</li>
                <li>Nâng cao cơ hội thăng tiến</li>
              </ul>
            </article>

            <article className="glass rounded-2xl p-4">
              <div className="relative overflow-hidden rounded-xl border border-dashed border-primary/40 bg-card/60 p-3">
                <Image
                  src="/placeholder.jpg"
                  alt="Overview image placeholder"
                  width={1200}
                  height={900}
                  className="h-[360px] w-full rounded-lg object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <p className="rounded-md border border-white/25 bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                    Overview Image Frame
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Placeholder frame: replace with your key section image.</p>
            </article>
          </div>
        </section>

        <section id="books-author" className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <article className="glass w-full rounded-3xl p-5 sm:p-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70">
                    <Image
                      src="/books/author.png"
                      alt="Author image"
                      width={600}
                      height={900}
                      className="h-[340px] w-full object-cover lg:h-full"
                    />
                </div>

                <div className="space-y-5 text-muted-foreground">
                  <h2 className="text-4xl font-extrabold leading-tight text-foreground">Về tác giả</h2>

                  <p className="text-3xl font-semibold leading-snug text-red-700">
                    Cử nhân Ngôn ngữ Hàn Quốc - Đại học Hà Nội
                  </p>

                  <p className="text-3xl font-semibold leading-snug text-red-700">
                    Thạc sĩ Quản trị Kinh doanh - Đại học Soongsil, Hàn Quốc
                  </p>

                  <p className="text-[1.15rem] leading-relaxed text-muted-foreground">
                    Nhà sáng lập kiêm Giám đốc điều hành Công ty <span className="font-extrabold text-foreground">HDP HOLDINGS</span>, đơn vị tư vấn chiến lược và cung cấp giải pháp toàn diện cho doanh nghiệp Việt Nam và doanh nghiệp FDI, đặc biệt là doanh nghiệp Hàn Quốc.
                  </p>

                  <p className="text-[1.15rem] leading-relaxed text-muted-foreground">
                    Hiện là chuyên gia cố vấn cho nhiều hiệp hội doanh nghiệp, cơ quan xúc tiến đầu tư - thương mại của Việt Nam và Hàn Quốc, với kinh nghiệm sâu rộng trong lĩnh vực phát triển doanh nghiệp, hợp tác quốc tế và đào tạo nguồn nhân lực chất lượng cao.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="books-cta" className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="w-full rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/10 p-8 text-center sm:p-12">
              <p className="mb-3 inline-flex rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                Còn đúng 74 cuốn
              </p>
              <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Đăng ký mua sách ngay</h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                Số lượng đợt in đầu đang gần hết. Đặt mua ngay để nhận ưu đãi giảm 10% và sớm sở hữu cẩm nang thực chiến
                cho môi trường sản xuất Hàn Quốc.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <p className="text-muted-foreground line-through">Giá Bìa: 250.000đ</p>
                <p className="text-2xl font-extrabold text-primary">💰 Giá Bán: 225.000đ</p>
                <p className="font-semibold text-emerald-300">🎁 Giảm 10% !!!</p>
              </div>
              <Link
                href="/auth"
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.4)] transition hover:scale-[1.02] hover:bg-primary/90"
              >
                Đăng ký mua sách ngay
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
