# Email Marketing Automation Plan — HDP EDU

## Platform Decision: Resend (NOT Brevo/Mailchimp)

**Reasoning:**
- Resend API key already configured in the deployment environment (`RESEND_API_KEY`; see `.env.example`)
- Resend delivers transactional + marketing emails, free tier: 3,000/mo
- Brevo requires new account setup, domain verification
- Convex action already wired to Resend (`convex/lib/email.ts` `sendEmail()`)
- From address: `HDP EDU <onboarding@resend.dev>` (needs domain verification for production)

## Welcome Email Sequence (3 emails)

| # | Trigger | Subject | Content |
|---|---------|---------|---------|
| 1 | Lead sign-up | Chào mừng đến HDP EDU | Giới thiệu platform, Korean learning path |
| 2 | 24h sau | Bắt đầu học Korean? | Link bài test đầu vào + tài liệu miễn phí |
| 3 | 72h sau | Học viên HDP EDU đang chờ bạn | Khóa học phổ biến, testimonial |

## Course Reminder Emails

- 3 ngày trước khóa học bắt đầu
- 1 ngày trước + tài liệu chuẩn bị
- Sau 7 ngày không mở khóa → re-engagement

## Promotional Template

-Ưu đãi khóa học mới, early-bird discount

## Automation Triggers

- Convex actions + Resend webhooks
- Segment: new leads, active students, lapsed users

## Test Plan

- Gửi test tới minhhoangd852@gmail.com
- Kiểm tra deliverability, open rate > 20%
- Domain verification cho production từ

## Child Issues Created
- HDP-30: Choose email platform (Resend vs Brevo) → DONE
- HDP-31: Welcome email sequence (3 emails) → TODO
- HDP-32: Course reminder emails → TODO
- HDP-33: Promotional email template → TODO
- HDP-34: Automation triggers → TODO
- HDP-35: Test email delivery → TODO