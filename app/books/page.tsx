'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';

const heroImages = [
  { src: '/books/cover1.png', alt: 'Tiếng Hàn Trong Nhà Máy Sản Xuất - Bìa sách' },
  { src: '/books/cover2.png', alt: 'Bìa sau với giới thiệu tác giả' },
  { src: '/books/cover3.png', alt: 'Sách trên bàn' },
  { src: '/books/1.png', alt: 'Trang tiêu đề' },
  { src: '/books/2.png', alt: 'Nội dung bộ phận SMT' },
  { src: '/books/3.png', alt: 'Bảng thuật ngữ song ngữ' },
];

export default function BooksPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />
      <ParticleBackground />

      <main className="relative z-10 pb-16 pt-20">
        <section id="books-hero" className="flex min-h-[90vh] items-center py-12">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-16">
            <div className="animate-slide-in-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-700/30 bg-gradient-to-r from-red-50 to-red-100 px-4 py-2 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-red-700" />
                <span className="text-xs font-semibold tracking-wide text-red-800">
                  Sách - &quot;Tiếng Hàn Trong Nhà Máy Sản Xuất&quot;
                </span>
              </div>

              <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Cuốn sách thực chiến dành riêng cho{' '}
                <span className="bg-gradient-to-r from-red-500 via-red-600 to-amber-500 bg-clip-text text-transparent">
                  môi trường sản xuất
                </span>
              </h1>

              <p className="max-w-2xl text-lg font-light leading-relaxed text-muted-foreground">
                Giúp bạn hiểu quy trình, thuật ngữ, bối cảnh giao tiếp và tự tin làm việc với quản lý Hàn Quốc.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="glass rounded-2xl border border-primary/20 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Còn lại</p>
                  </div>
                  <p className="text-3xl font-black text-primary">74 cuốn</p>
                  <p className="mt-1 text-xs text-muted-foreground">Trong kho</p>
                </div>

                <div className="glass rounded-2xl border border-amber-500/20 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-lg bg-amber-500/10 p-1.5">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tình trạng</p>
                  </div>
                  <p className="flex items-center gap-1.5 text-xl font-black text-amber-300 sm:text-2xl">
                    <span>🔥</span> Sắp hết
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Đợt in đầu</p>
                </div>
              </div>

              <div className="glass relative overflow-hidden rounded-2xl border border-emerald-500/20 p-5">
                <div className="books-decor-circle absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
                <div className="relative">
                  <div className="mb-2 flex items-baseline gap-3">
                    <p className="text-lg text-muted-foreground line-through decoration-2">250.000đ</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
                      <span>🎁</span> -10%
                    </span>
                  </div>
                  <p className="mb-1 text-4xl font-black text-primary">225.000đ</p>
                  <p className="text-xs font-medium text-muted-foreground">Ưu đãi đợt đầu • Tiết kiệm 25.000đ</p>
                </div>
              </div>

              <Link
                href="/books/purchase"
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-8 py-4 text-base font-bold text-white shadow-[0_16px_50px_rgba(185,28,28,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_16px_50px_rgba(185,28,28,0.55)]"
              >
                Đăng ký mua sách ngay
                <CheckCircle2 className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="animate-slide-in-right space-y-4">
              <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-card/80 p-4 shadow-xl transition-transform duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <Image
                  src={heroImages[0].src}
                  alt={heroImages[0].alt}
                  width={1200}
                  height={800}
                  className="relative h-[280px] w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[340px] lg:h-[380px]"
                  priority
                />
                <div className="absolute left-6 top-6 rounded-xl border border-white/20 bg-black/80 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
                  {heroImages[0].alt}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {heroImages.slice(1).map((image, index) => (
                  <div
                    key={image.src}
                    className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 p-2 shadow-md transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={320}
                      height={240}
                      className="h-24 w-full rounded-lg object-cover transition duration-700 group-hover:scale-110 sm:h-20"
                    />
                    <div className="mt-1.5 text-[10px] font-semibold leading-tight text-muted-foreground sm:text-xs">
                      {image.alt}
                    </div>
                    <div className="absolute right-2 top-2 rounded-lg border border-white/20 bg-black/80 px-2 py-1 text-[9px] font-black text-white shadow-lg backdrop-blur-md">
                      #{index + 2}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="books-overview" className="bg-gradient-to-b from-transparent via-muted/20 to-transparent py-16 sm:py-20">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 px-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <article className="glass animate-slide-in-left rounded-3xl p-8 shadow-xl sm:p-10">
              <div className="mb-5 flex items-center gap-2">
                <div className="rounded-xl bg-red-700/10 p-2">
                  <BookOpen className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-red-400">Giới thiệu</p>
              </div>

              <h2 className="mb-6 text-3xl font-black leading-tight text-foreground sm:text-4xl">Giới thiệu cuốn sách</h2>

              <div className="space-y-4 text-base font-light leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Tiếng Hàn trong nhà máy sản xuất</span> - Cẩm nang giao tiếp thực chiến cho môi trường công nghiệp Hàn Quốc. Trong các nhà máy có vốn đầu tư Hàn Quốc, ngôn ngữ không chỉ để giao tiếp mà còn ảnh hưởng trực tiếp đến hiệu suất, an toàn và cơ hội thăng tiến.
                </p>
                <p>
                  Cuốn sách được biên soạn nhằm cung cấp hệ thống tiếng Hàn chuyên ngành sản xuất sát thực tế, giúp người học sử dụng đúng từ vựng, đúng ngữ cảnh và đúng tình huống công việc.
                </p>
              </div>

              <div className="my-8 h-px bg-gradient-to-r from-red-700/20 via-red-700/50 to-red-700/20" />

              <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-foreground">
                <div className="h-6 w-1 rounded-full bg-gradient-to-b from-red-600 to-red-800" />
                Nội dung trọng tâm
              </h3>
              <ul className="grid grid-cols-1 gap-2.5 text-sm sm:text-base">
                <li className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-emerald-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">PPC, IQC, Dập kim loại, Ép nhựa - Khuôn, SMT, Sơn - Phủ bề mặt</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-emerald-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Lắp ráp, QC công đoạn, Bảo trì, Automation</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-emerald-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Kỹ thuật sản phẩm, Kỹ thuật công đoạn, R&amp;D, OQC...</span>
                </li>
              </ul>

              <div className="my-8 h-px bg-gradient-to-r from-blue-700/20 via-blue-700/50 to-blue-700/20" />

              <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-foreground">
                <div className="rounded-lg bg-blue-500/10 p-1.5">
                  <GraduationCap className="h-5 w-5 text-blue-300" />
                </div>
                Phù hợp với
              </h3>
              <ul className="space-y-2.5 text-sm sm:text-base">
                <li className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-blue-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-blue-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Người lao động tại nhà máy Hàn Quốc</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-blue-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-blue-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Kỹ thuật viên, QA - QC, tổ trưởng, quản lý sản xuất</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-blue-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-blue-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Sinh viên khối kỹ thuật, ứng viên phỏng vấn công ty Hàn</span>
                </li>
              </ul>

              <div className="my-8 h-px bg-gradient-to-r from-amber-700/20 via-amber-700/50 to-amber-700/20" />

              <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-foreground">
                <div className="rounded-lg bg-amber-500/10 p-1.5">
                  <Award className="h-5 w-5 text-amber-300" />
                </div>
                Giá trị mang lại
              </h3>
              <ul className="space-y-2.5 text-sm sm:text-base">
                <li className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-amber-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Giao tiếp chính xác trong môi trường sản xuất</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-amber-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Tự tin làm việc với quản lý người Hàn</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-amber-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Hạn chế sai sót do hiểu nhầm</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <div className="mt-0.5 rounded-lg bg-amber-500/20 p-1">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  </div>
                  <span className="font-medium text-muted-foreground">Nâng cao cơ hội thăng tiến</span>
                </li>
              </ul>
            </article>

            <div className="animate-slide-in-right space-y-6">
              <article className="glass rounded-3xl p-5 shadow-xl transition-transform duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/10 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />
                  <Image
                    src="/books/cover2.png"
                    alt="Bìa sau sách với thông tin tác giả"
                    width={1200}
                    height={900}
                    className="relative h-[300px] w-full rounded-xl object-cover shadow-lg transition-all duration-700 hover:scale-105"
                  />
                </div>
                <div className="mt-4 rounded-xl border border-border/30 bg-gradient-to-br from-muted/30 to-transparent p-4">
                  <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
                    <span className="text-foreground">Bìa sau</span> với giới thiệu chi tiết về tác giả.
                  </p>
                </div>
              </article>

              <div className="glass rounded-2xl p-5 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                  <Sparkles className="h-4 w-4 text-red-400" />
                  Điểm nổi bật
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-3 text-center">
                    <p className="mb-1 text-2xl font-black text-red-300">12+</p>
                    <p className="text-xs font-medium text-muted-foreground">Chuyên đề</p>
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-3 text-center">
                    <p className="mb-1 text-2xl font-black text-blue-300">500+</p>
                    <p className="text-xs font-medium text-muted-foreground">Từ vựng</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-3 text-center">
                    <p className="mb-1 text-2xl font-black text-emerald-300">100+</p>
                    <p className="text-xs font-medium text-muted-foreground">Mẫu câu</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-3 text-center">
                    <p className="mb-1 text-2xl font-black text-amber-300">Real</p>
                    <p className="text-xs font-medium text-muted-foreground">Tình huống</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="books-author" className="py-16 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
            <article className="glass animate-slide-up relative w-full overflow-hidden rounded-3xl p-8 shadow-2xl sm:p-12">
              <div className="books-decor-circle absolute right-0 top-0 h-72 w-72 rounded-full bg-red-700/10 blur-3xl" />
              <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
                <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-xl transition-transform duration-300 hover:-translate-y-1">
                  <Image
                    src="/books/author.png"
                    alt="Dương Thu Hương - Tác giả"
                    width={600}
                    height={900}
                    className="h-[340px] w-full object-cover transition-transform duration-700 hover:scale-105 lg:h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:from-black/40" />
                  <div className="absolute bottom-5 left-5 right-5 lg:hidden">
                    <p className="text-base font-bold text-white">Dương Thu Hương</p>
                    <p className="text-xs text-white/90">Tác giả &amp; CEO HDP Holdings</p>
                  </div>
                </div>

                <div className="space-y-6 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-700/10 p-2">
                      <Award className="h-6 w-6 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">Về tác giả</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-red-700/10 p-1.5">
                          <GraduationCap className="h-5 w-5 text-red-400" />
                        </div>
                        <p className="text-lg font-black leading-tight sm:text-xl">
                          <span className="bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">
                            Cử nhân Ngôn ngữ Hàn Quốc
                          </span>
                          <br />
                          <span className="text-base font-semibold text-muted-foreground">Đại học Hà Nội</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-red-700/10 p-1.5">
                          <GraduationCap className="h-5 w-5 text-red-400" />
                        </div>
                        <p className="text-lg font-black leading-tight sm:text-xl">
                          <span className="bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">
                            Thạc sĩ Quản trị Kinh doanh
                          </span>
                          <br />
                          <span className="text-base font-semibold text-muted-foreground">Đại học Soongsil, Hàn Quốc</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-red-700/20 via-red-700/50 to-red-700/20" />

                  <div className="space-y-4">
                    <p className="text-base font-light leading-relaxed text-muted-foreground">
                      Nhà sáng lập kiêm Giám đốc điều hành Công ty{' '}
                      <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-lg font-black text-transparent">
                        HDP HOLDINGS
                      </span>
                      , đơn vị tư vấn chiến lược và cung cấp giải pháp toàn diện cho doanh nghiệp Việt Nam và doanh nghiệp FDI, đặc biệt là doanh nghiệp Hàn Quốc.
                    </p>

                    <p className="text-base font-light leading-relaxed text-muted-foreground">
                      Hiện là chuyên gia cố vấn cho nhiều hiệp hội doanh nghiệp, cơ quan xúc tiến đầu tư - thương mại của Việt Nam và Hàn Quốc, với kinh nghiệm sâu rộng trong lĩnh vực phát triển doanh nghiệp, hợp tác quốc tế và đào tạo nguồn nhân lực chất lượng cao.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="books-cta" className="bg-gradient-to-b from-transparent via-red-500/10 to-transparent py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
            <div className="relative w-full overflow-hidden rounded-3xl border-2 border-red-700/20 bg-gradient-to-br from-red-50/15 via-card to-red-500/10 p-10 text-center shadow-[0_20px_80px_rgba(220,38,38,0.15)] sm:p-14">
              <div className="books-decor-circle absolute right-0 top-0 h-72 w-72 rounded-full bg-red-700/10 blur-3xl" />
              <div className="books-decor-circle absolute bottom-0 left-0 h-64 w-64 rounded-full bg-red-800/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-700/30 bg-gradient-to-r from-red-100 to-red-50 px-5 py-2.5 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
                    <Sparkles className="h-4 w-4 text-red-700" />
                  </div>
                  <span className="text-xs font-black tracking-wide text-red-800">Còn đúng 74 cuốn • Đang cận kệ</span>
                </div>

                <h2 className="mb-3 text-4xl font-black leading-[1.1] text-foreground sm:text-5xl">
                  Đăng ký mua{' '}
                  <span className="bg-gradient-to-r from-red-500 via-red-600 to-amber-500 bg-clip-text text-transparent">
                    sách ngay
                  </span>
                </h2>

                <p className="mx-auto mt-6 max-w-3xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                  Số lượng đợt in đầu đang gần hết. Đặt mua ngay để nhận ưu đãi{' '}
                  <span className="font-bold text-emerald-300">giảm 10%</span> và sớm sở hữu cẩm nang thực chiến cho môi trường sản xuất Hàn Quốc.
                </p>

                <div className="mt-8 inline-flex flex-col items-center gap-5 rounded-2xl border border-border/40 bg-background/40 p-5 shadow-xl backdrop-blur-md sm:flex-row">
                  <div className="text-center">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giá gốc</p>
                    <p className="text-xl text-muted-foreground line-through decoration-2">250.000đ</p>
                  </div>
                  <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:block" />
                  <div className="text-center">
                    <p className="mb-1.5 flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      <span>🎁</span> Ưu đãi
                    </p>
                    <p className="text-4xl font-black text-primary">225.000đ</p>
                  </div>
                  <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:block" />
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-base font-black text-white shadow-lg shadow-emerald-500/30">
                      Giảm 10%
                    </span>
                  </div>
                </div>

                <Link
                  href="/books/purchase"
                  className="mt-10 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-10 py-4 text-lg font-black text-white shadow-[0_20px_60px_rgba(185,28,28,0.45)] transition-all hover:scale-[1.05] hover:shadow-[0_20px_60px_rgba(185,28,28,0.6)]"
                >
                  Đăng ký mua sách ngay
                  <CheckCircle2 className="h-6 w-6" />
                </Link>

                <p className="mt-5 text-xs font-medium text-muted-foreground">
                  ⚡ Giao hàng toàn quốc • 📦 Đóng gói cẩn thận • ✅ Đảm bảo chất lượng
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
