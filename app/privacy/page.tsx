'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

function PrivacyContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-16 pt-28">
        <h1 className="mb-4 text-4xl font-bold">Chính sách Bảo mật</h1>
        <p className="mb-8 text-muted-foreground">
          Cập nhật lần cuối: 10/06/2026 · HDP EDU / HDP Holdings
        </p>
        <div className="home-card space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            HDP EDU cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách này giải
            thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu của bạn khi sử dụng
            dịch vụ HDP EDU (hdpedu.com).
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Thông tin Chúng tôi Thu thập</h2>
            <p>Chúng tôi thu thập các loại thông tin sau:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Thông tin bạn cung cấp:</strong> Họ tên, email, số điện thoại, mật khẩu
                (mã hoá), địa chỉ, thông tin thanh toán khi đăng ký tài khoản hoặc mua khoá học.
              </li>
              <li>
                <strong>Thông tin học tập:</strong> Tiến độ học, kết quả bài kiểm tra, chứng chỉ,
                tương tác với nội dung.
              </li>
              <li>
                <strong>Thông tin thiết bị:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành,
                nhật ký truy cập, cookies và công nghệ tương tự.
              </li>
              <li>
                <strong>Thông tin liên lạc:</strong> Nội dung tin nhắn, email, yêu cầu hỗ trợ khi
                bạn liên hệ với chúng tôi.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Cách Chúng tôi Sử dụng Thông tin</h2>
            <p>Chúng tôi sử dụng thông tin của bạn để:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Cung cấp và quản lý tài khoản người dùng</li>
              <li>Xử lý thanh toán và giao dịch mua khoá học</li>
              <li>Cung cấp nội dung học tập và cá nhân hóa trải nghiệm</li>
              <li>Gửi thông báo quan trọng về tài khoản, khoá học, chính sách</li>
              <li>Phân tích hành vi sử dụng để cải thiện dịch vụ</li>
              <li>Phòng chống gian lận, lạm dụng và bảo vệ an ninh hệ thống</li>
              <li>Tuân thủ nghĩa vụ pháp lý và giải quyết tranh chấp</li>
            </ul>
            <p>
              Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba vì mục
              đích thương mại.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Chia sẻ Thông tin</h2>
            <p>
              Chúng tôi có thể chia sẻ thông tin của bạn với các bên sau trong các trường hợp giới
              hạn:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Nhà cung cấp thanh toán:</strong> PayOS, MoMo, VNPay — để xử lý giao dịch
                mua khoá học.
              </li>
              <li>
                <strong>Nhà cung cấp dịch vụ:</strong> Cloudflare (hosting), Convex (backend),
                Resend (email), Google Analytics (phân tích) — theo hợp đồng bảo mật dữ liệu.
              </li>
              <li>
                <strong>Cơ quan pháp luật:</strong> Khi có yêu cầu hợp pháp từ cơ quan chức năng
                có thẩm quyền.
              </li>
              <li>
                <strong>Bảo vệ quyền:</strong> Khi cần thiết để bảo vệ quyền, tài sản hoặc an toàn
                của HDP EDU, người dùng hoặc công chúng.
              </li>
            </ul>
            <p>
              Các bên thứ ba này chỉ được phép sử dụng thông tin theo hướng dẫn của chúng tôi và
              phải tuân thủ nghĩa vụ bảo mật.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Cookies & Công nghệ Theo dõi</h2>
            <p>
              Chúng tôi sử dụng cookies và công nghệ tương tự để:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Ghi nhớ trạng thái đăng nhập và tùy chọn ngôn ngữ</li>
              <li>Phân tích lưu lượng truy cập và hành vi sử dụng</li>
              <li>Cải thiện hiệu suất và bảo mật trang web</li>
              <li>Cá nhân hóa nội dung và quảng cáo (nếu có)</li>
            </ul>
            <p>
              Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng có thể không
              hoạt động đúng nếu cookies bị vô hiệu hoá.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Lưu trữ & Bảo mật Dữ liệu</h2>
            <p>
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ dữ liệu của
              bạn:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Mã hoá dữ liệu trong quá trình truyền (TLS/SSL)</li>
              <li>Mã hoá mật khẩu người dùng (bcrypt)</li>
              <li>Kiểm soát truy cập dựa trên vai trò (RBAC)</li>
              <li>Sao lưu dữ liệu định kỳ</li>
              <li>Đánh giá bảo mật định kỳ</li>
            </ul>
            <p>
              Dữ liệu của bạn được lưu trữ trên các máy chủ an toàn của Cloudflare và Convex. Thời
              gian lưu trữ dữ liệu tùy thuộc vào loại dữ liệu và mục đích sử dụng, thông thường là
              trong thời gian tài khoản của bạn còn hoạt động cộng thêm thời gian tuân thủ pháp lý.
            </p>
            <p>
              Mặc dù chúng tôi nỗ lực bảo vệ dữ liệu, không có phương thức truyền tải hoặc lưu trữ
              nào an toàn tuyệt đối. Bạn nên tự bảo vệ thông tin đăng nhập của mình.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Quyền của Người dùng</h2>
            <p>Bạn có các quyền sau đối với dữ liệu cá nhân của mình:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Truy cập:</strong> Yêu cầu sao chép dữ liệu cá nhân mà chúng tôi lưu trữ.
              </li>
              <li>
                <strong>Sửa đổi:</strong> Cập nhật hoặc sửa chữa thông tin không chính xác.
              </li>
              <li>
                <strong>Xoá:</strong> Yêu cầu xoá dữ liệu cá nhân (trừ khi pháp luật yêu cầu lưu
                trữ).
              </li>
              <li>
                <strong>Hạn chế xử lý:</strong> Yêu cầu hạn chế việc xử lý dữ liệu trong một số
                trường hợp.
              </li>
              <li>
                <strong>Phản đối:</strong> Phản đối việc xử lý dữ liệu cho mục đích tiếp thị.
              </li>
              <li>
                <strong>Chuyển giao dữ liệu:</strong> Nhận dữ liệu ở định dạng có cấu trúc, đọc
                được bằng máy.
              </li>
            </ul>
            <p>
              Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua{' '}
              <Link href="/contact-us?topic=privacy" className="text-primary hover:underline">
                trang liên hệ
              </Link>
              . Chúng tôi sẽ phản hồi trong vòng 30 ngày.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Dữ liệu Trẻ em</h2>
            <p>
              Dịch vụ HDP EDU không dành cho người dưới 13 tuổi. Chúng tôi không cố ý thu thập thông
              tin cá nhân từ trẻ em dưới 13 tuổi. Nếu phát hiện trẻ em dưới 13 tuổi cung cấp thông
              tin, chúng tôi sẽ xoá dữ liệu đó ngay lập tức.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Chuyển giao Dữ liệu Quốc tế</h2>
            <p>
              Dữ liệu của bạn có thể được xử lý và lưu trữ trên máy chủ nằm ở nước ngoài (ví dụ:
              Cloudflare, Convex). Chúng tôi đảm bảo rằng các chuyển giao dữ liệu quốc tế tuân thủ
              các quy định bảo vệ dữ liệu hiện hành và áp dụng các biện pháp bảo vệ phù hợp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Thay đổi Chính sách</h2>
            <p>
              Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Các thay đổi sẽ được
              đăng tải trên trang này với ngày cập nhật mới. Chúng tôi khuyến khích bạn xem lại
              chính sách định kỳ để cập nhật thông tin.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Liên hệ</h2>
            <p>
              Nếu bạn có câu hỏi, khiếu nại hoặc yêu cầu liên quan đến quyền riêng tư và bảo mật
              dữ liệu, vui lòng liên hệ:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Website:{' '}
                <Link href="/contact-us?topic=privacy" className="text-primary hover:underline">
                  hdpedu.com/contact-us
                </Link>
              </li>
              <li>Email: privacy@hdpedu.com</li>
              <li>Hotline: 0901 234 567</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">English Version — Privacy Policy</h2>
            <p>
              HDP EDU is committed to protecting your privacy. This policy explains how we collect,
              use, store, and protect your data when you use our services.
            </p>
            <p>
              <strong>1. Information We Collect.</strong> We collect information you provide (name,
              email, phone, payment details), learning progress (course access, quiz results),
              device information (IP address, browser type, cookies), and communications (support
              requests, messages).
            </p>
            <p>
              <strong>2. How We Use Information.</strong> We use your data to provide and manage
              your account, process payments, deliver and personalize learning content, send
              important notifications, analyze usage to improve services, prevent fraud, and comply
              with legal obligations. We do <strong>not sell</strong> your personal data to third
              parties.
            </p>
            <p>
              <strong>3. Information Sharing.</strong> We may share data with payment processors
              (PayOS, MoMo, VNPay), service providers (Cloudflare, Convex, Resend, Google Analytics)
              under data protection agreements, law enforcement when legally required, and to
              protect rights and safety.
            </p>
            <p>
              <strong>4. Cookies & Tracking.</strong> We use cookies for session management,
              language preferences, analytics, and security. You may disable cookies in your browser
              settings, but some features may not function properly.
            </p>
            <p>
              <strong>5. Data Storage & Security.</strong> We apply TLS/SSL encryption, password
              hashing (bcrypt), role-based access control, and regular backups. Data is stored on
              secure Cloudflare and Convex servers. We retain data for the duration of your account
              plus any legally required retention period.
            </p>
            <p>
              <strong>6. Your Rights.</strong> You have the right to access, correct, delete,
              restrict processing, object to marketing, and request data portability. To exercise
              these rights, contact us via{' '}
              <Link href="/contact-us?topic=privacy" className="text-primary hover:underline">
                our contact page
              </Link>
              . We will respond within 30 days.
            </p>
            <p>
              <strong>7. Children's Data.</strong> Our service is not intended for children under
              13. We do not knowingly collect personal data from children under 13.
            </p>
            <p>
              <strong>8. International Transfers.</strong> Your data may be processed on servers
              located outside Vietnam. We ensure international transfers comply with applicable data
              protection regulations.
            </p>
            <p>
              <strong>9. Changes to Policy.</strong> We may update this policy from time to time.
              Changes will be posted on this page with an updated date.
            </p>
            <p>
              <strong>10. Contact.</strong> For privacy-related inquiries, visit{' '}
              <Link href="/contact-us?topic=privacy" className="text-primary hover:underline">
                hdpedu.com/contact-us
              </Link>{' '}
              or email privacy@hdpedu.com.
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

export default function PrivacyPage() {
  return (
    <ClientOnly>
      <PrivacyContent />
    </ClientOnly>
  );
}
