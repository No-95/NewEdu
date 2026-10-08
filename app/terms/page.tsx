'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

function TermsContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-16 pt-28">
        <h1 className="mb-4 text-4xl font-bold">Điều khoản Dịch vụ</h1>
        <p className="mb-8 text-muted-foreground">
          Cập nhật lần cuối: 10/06/2026 · HDP EDU / HDP Holdings
        </p>
        <div className="home-card space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            Bằng việc sử dụng HDP EDU (hdpedu.com), bạn đồng ý tuân thủ các điều khoản dưới đây.
            Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Mô tả Dịch vụ</h2>
            <p>
              HDP EDU là nền tảng giáo dục trực tuyến cung cấp các khoá học tiếng Hàn chuyên ngành
              sản xuất, công xưởng, nhà máy dành cho người Việt Nam. Dị ch vụ bao gồm:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Khoá học video trực tuyến (72 bài giảng, 15 unit)</li>
              <li>Sách giáo trình "Tiếng Hàn Sản xuất"</li>
              <li>Cộng đồng học tập và tư vấn nghề nghiệp</li>
              <li>Các dịch vụ hỗ trợ học tập khác</li>
            </ul>
            <p>
              Chúng tôi có quyền cập nhật, thay đổi hoặc ngừng cung cấp bất kỳ phần nào của dịch vụ
              với thông báo hợp lý đến người dùng.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Tài khoản Người dùng</h2>
            <p>
              Khi tạo tài khoản trên HDP EDU, bạn cam kết cung cấp thông tin chính xác, đầy đủ và
              cập nhật. Bạn có trách nhiệm:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Bảo mật thông tin đăng nhập và mật khẩu</li>
              <li>Không chia sẻ tài khoản với bên thứ ba</li>
              <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
              <li>Chịu trách nhiệm về mọi hoạt động dưới tài khoản của bạn</li>
            </ul>
            <p>
              Chúng tôi có quyền đình chỉ hoặc khóa tài khoản vi phạm điều khoản mà không cần
              thông báo trước.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Mua hàng & Thanh toán</h2>
            <p>
              Khi mua khoá học hoặc sản phẩm trên HDP EDU, bạn đồng ý:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Thanh toán đầy đủ giá sản phẩm đã niêm yết tại thời điểm mua</li>
              <li>Chấp nhận các phương thức thanh doán được hỗ trợ (PayOS, MoMo, VNPay, chuyển khoản)</li>
              <li>Giá sản phẩm có thể thay đổi theo chính sách của HDP EDU</li>
            </ul>
            <p>
              <strong>Chính sách hoàn tiền:</strong> Bạn có quyền yêu cầu hoàn tiền trong vòng 7 ngày
              kể từ ngày mua nếu chưa truy cập quá 30% nội dung khoá học. Yêu cầu hoàn tiền sẽ được
              xử lý trong 5-7 ngày làm việc.
            </p>
            <p>
              <strong>Chính sách đổi trả:</strong> Sản phẩm sách đổi trả trong 14 ngày nếu còn nguyên
              tem, nhãn và chưa qua sử dụng.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Nội dung & Sở hữu Trí tuệ</h2>
            <p>
              Toàn bộ nội dung trên HDP EDU, bao gồm nhưng không giới hạn:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Video bài giảng, tài liệu, hình ảnh, đồ họa</li>
              <li>Sách giáo trình và tài liệu đi kèm</li>
              <li>Thiết kế, logo, thương hiệu HDP EDU</li>
              <li>Mã nguồn và công nghệ nền tảng</li>
            </ul>
            <p>
              đều thuộc quyền sở hữu của HDP Holdings và HDP EDU, được bảo vệ bởi luật sở hữu trí tuệ
              Việt Nam và quốc tế. Bạn không được:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Sao chép, phân phối, tái bán nội dung cho mục đích thương mại</li>
              <li>Ghi hình, ghi âm, chụp màn hình bài giảng để chia sẻ công khai</li>
              <li>Sử dụng công nghệ để trích xuất nội dung hàng loạt</li>
              <li>Sửa đổi, dịch thuật hoặc tạo tác phẩm phái sinh từ nội dung</li>
            </ul>
            <p>
              Vi phạm sở hữu trí tuệ có thể dẫn đến khóa tài khoản và xử lý pháp lý theo quy định
              của pháp luật.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Hành vi Bị cấm</h2>
            <p>Người dùng không được phép:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
              <li>Quấy rối, lạm dụng hoặc gây hại cho người dùng khác</li>
              <li>Đăng tải nội dung vi phạm bản quyền hoặc vi phạm pháp luật</li>
              <li>Spam, gửi thư rác hoặc quảng cáo trái phép</li>
              <li>Hack, tấn công hoặc cố gắng phá vỡ hệ thống bảo mật</li>
              <li>Sử dụng bot, script hoặc công nghệ tự động để truy cập dịch vụ</li>
              <li>Giả mạo danh tính hoặc cung cấp thông tin sai sự thật</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Bảo mật & Quyền riêng tư</h2>
            <p>
              Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo Chính sách Bảo mật (Privacy
              Policy) được đăng tải tại <Link href="/privacy" className="text-primary hover:underline">hdpedu.com/privacy</Link>.
              Bằng việc sử dụng dịch vụ, bạn đồng ý cho phép chúng tôi thu thập, sử dụng và bảo vệ
              thông tin của bạn theo chính sách đó.
            </p>
            <p>
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ dữ liệu người
              dùng, nhưng không thể đảm bảo an toàn tuyệt đối trước các rủi ro công nghệ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Miễn trừ Trách nhiệm</h2>
            <p>
              Dịch vụ HDP EDU được cung cấp "nguyên trạng" (as-is) và "như có sẵn" (as-available).
              Chúng tôi không đảm bảo rằng:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Dịch vụ sẽ không bị gián đoạn, lỗi hoặc an toàn hoàn toàn</li>
              <li>Kết quả học tập sẽ đáp ứng kỳ vọng cụ thể của bạn</li>
              <li>Nội dung sẽ hoàn toàn chính xác, đầy đủ và cập nhật</li>
              <li>Dịch vụ sẽ phù hợp với mọi mục đích sử dụng cụ thể</li>
            </ul>
            <p>
              Trong phạm vi tối đa cho phép bởi pháp luật, HDP Holdings và HDP EDU không chịu trách
              nhiệm về các thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc do hệ quả phát sinh từ
              việc sử dụng hoặc không thể sử dụng dị ch vụ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Thay đổi Điều khoản</h2>
            <p>
              Chúng tôi có quyền cập nhật hoặc sửa đổi các điều khoản này bất cứ lúc nào. Các thay
              đổi sẽ có hiệu lực ngay khi được đăng tải trên trang này. Chúng tôi khuyến khích bạn
              xem lại điều khoản định kỳ.
            </p>
            <p>
              Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn chấp nhận điều
              khoản mới.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Luật áp dụng & Giải quyết Tranh chấp</h2>
            <p>
              Các điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam. Mọi tranh
              chấp phát sinh từ hoặc liên quan đến việc sử dụng dịch vụ sẽ được giải quyết thông qua
              đàm phán hòa bình trước. Nếu không thể giải quyết, tranh chấp sẽ được đưa ra Tòa án
              có thẩm quyền tại Việt Nam.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Liên hệ</h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi, khiếu nại hoặc yêu cầu liên quan đến điều khoản dịch vụ,
              vui lòng liên hệ chúng tôi:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Website: <Link href="/contact-us" className="text-primary hover:underline">hdpedu.com/contact-us</Link></li>
              <li>Email: support@hdpedu.com</li>
              <li>Hotline: 0901 234 567</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">English Version — Terms of Service</h2>
            <p>
              By using HDP EDU (hdpedu.com), you agree to the following terms. If you do not agree
              with any part of these terms, please discontinue use of the service.
            </p>
            <p>
              <strong>1. Service Description.</strong> HDP EDU is an online education platform
              providing Korean language courses for manufacturing, factory, and industrial workplace
              contexts, targeted at Vietnamese learners. Services include online video courses
              (72 lectures, 15 units), the textbook "Tiếng Hàn Sản xuất", a learning community, and
              career advisory services.
            </p>
            <p>
              <strong>2. User Accounts.</strong> You agree to provide accurate and complete
              information when creating an account. You are responsible for maintaining the
              confidentiality of your login credentials and for all activities under your account.
            </p>
            <p>
              <strong>3. Purchases & Payment.</strong> All purchases are subject to the listed price
              at the time of purchase. We support PayOS, MoMo, VNPay, and bank transfer. Refund
              requests within 7 days of purchase (with less than 30% course content accessed) will be
              processed within 5-7 business days.
            </p>
            <p>
              <strong>4. Content & Intellectual Property.</strong> All content on HDP EDU — including
              videos, documents, graphics, logos, and source code — is the property of HDP Holdings
              and HDP EDU, protected by Vietnamese and international intellectual property laws.
              Unauthorized reproduction, distribution, or commercial use is strictly prohibited.
            </p>
            <p>
              <strong>5. Prohibited Conduct.</strong> Users may not use the service for unlawful
              purposes, harass other users, upload infringing content, spam, hack, or use automated
              tools to access the platform.
            </p>
            <p>
              <strong>6. Privacy.</strong> Your personal information is handled according to our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
            <p>
              <strong>7. Disclaimer.</strong> The service is provided "as-is" and "as-available."
              We do not warrant uninterrupted, error-free, or fully secure service. HDP Holdings and
              HDP EDU shall not be liable for indirect, incidental, or consequential damages.
            </p>
            <p>
              <strong>8. Changes to Terms.</strong> We may update these terms at any time. Changes
              are effective upon posting. Continued use of the service constitutes acceptance of the
              updated terms.
            </p>
            <p>
              <strong>9. Governing Law.</strong> These terms are governed by the laws of Vietnam.
              Disputes shall be resolved through negotiation first, then by competent courts in
              Vietnam if necessary.
            </p>
            <p>
              <strong>10. Contact.</strong> For questions regarding these terms, visit{' '}
              <Link href="/contact-us" className="text-primary hover:underline">hdpedu.com/contact-us</Link>{' '}
              or email support@hdpedu.com.
            </p>
          </section>
        </div>
        <Link href="/auth" className="mt-8 inline-block text-primary hover:underline">
          ← Back to sign in
        </Link>
      </main>
    </div>
  );
}

export default function TermsPage() {
  return (
    <ClientOnly>
      <TermsContent />
    </ClientOnly>
  );
}
