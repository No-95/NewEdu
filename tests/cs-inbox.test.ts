import { describe, it, expect } from 'vitest';
import {
  normalizeAddress,
  addressDomain,
  isAutomaticMessage,
  previewText,
  selectNewReplies,
  matchLead,
  formatReplyMarkdown,
  isAllowedSender,
  isSelfSent,
  toIsoOrNull,
} from '../scripts/lib/cs-inbox.mjs';

describe('cs-inbox normalizeAddress — tách địa chỉ email từ RFC 5322 (HDP-16)', () => {
  it('bóc địa chỉ trong dấu ngoặc nhọn kèm tên hiển thị', () => {
    expect(normalizeAddress('"Nguyễn Văn A" <a@b.com>')).toBe('a@b.com');
    expect(normalizeAddress('Seungbeom Suh <seungbeom@iljin.co.kr>')).toBe('seungbeom@iljin.co.kr');
  });

  it('viết thường và bỏ dấu câu đuôi', () => {
    expect(normalizeAddress('  Sem-Diamond@Example.COM, ')).toBe('sem-diamond@example.com');
  });

  it('trả null khi không có địa chỉ', () => {
    expect(normalizeAddress('')).toBeNull();
    expect(normalizeAddress(null)).toBeNull();
    expect(normalizeAddress('không có địa chỉ')).toBeNull();
  });

  it('trích domain', () => {
    expect(addressDomain('a@b.com')).toBe('b.com');
    expect(addressDomain(null)).toBeNull();
  });
});

describe('cs-inbox isAutomaticMessage — không đọc thư máy (HDP-16)', () => {
  it('bỏ qua auto-submitted', () => {
    expect(isAutomaticMessage({ headers: { 'auto-submitted': 'auto-replied' } })).toBe(true);
  });

  it('bỏ qua noreply / mailer-daemon theo localpart', () => {
    expect(isAutomaticMessage({ from: 'no-reply@hdpedu.com', headers: {} })).toBe(true);
    expect(isAutomaticMessage({ from: 'MAILER-DAEMON@mx.zoho.com', headers: {} })).toBe(true);
  });

  it('giữ lại thư người thật', () => {
    expect(isAutomaticMessage({ from: 'seungbeom@iljin.co.kr', headers: {} })).toBe(false);
  });

  it('bỏ qua khi không có From', () => {
    expect(isAutomaticMessage({ from: null, headers: {} })).toBe(true);
  });
});

describe('cs-inbox selectNewReplies — chỉ lấy thư mới, bỏ thư máy (HDP-16)', () => {
  const seen = ['m1'];

  it('bỏ thư đã đọc, giữ thư mới, sắp xếp theo thời gian', () => {
    const out = selectNewReplies(
      [
        { id: 'm3', from: 'c@c.com', receivedAt: '2026-10-14T10:00:00Z', body: 'm3' },
        { id: 'm1', from: 'a@a.com', receivedAt: '2026-10-10T10:00:00Z', body: 'm1' },
        { id: 'm2', from: 'b@b.com', receivedAt: '2026-10-11T10:00:00Z', body: 'm2' },
      ],
      seen,
    );
    expect(out.replies.map((r) => r.id)).toEqual(['m2', 'm3']);
    expect(out.skippedSeen).toBe(1);
  });

  it('bỏ thư máy và cập nhật seenIds', () => {
    const out = selectNewReplies(
      [{ id: 'm9', from: 'noreply@x.com', receivedAt: '2026-10-14T10:00:00Z', body: 'm9', headers: {} }],
      [],
    );
    expect(out.replies).toHaveLength(0);
    expect(out.skippedAutomatic).toBe(1);
    expect(out.seenIds).toContain('m9');
  });

  it('id ổn định qua các lần poll', () => {
    const first = selectNewReplies([{ id: 'm5', from: 'a@a.com', receivedAt: '2026-10-14T10:00:00Z', body: 'b' }], []);
    const second = selectNewReplies([{ id: 'm5', from: 'a@a.com', receivedAt: '2026-10-14T10:00:00Z', body: 'b' }], first.seenIds);
    expect(second.replies).toHaveLength(0);
    expect(second.skippedSeen).toBe(1);
  });

  it('không vỡ khi header ngày hỏng — ghi null thay vì ném lỗi', () => {
    expect(toIsoOrNull('not-a-date')).toBeNull();
    expect(toIsoOrNull('')).toBeNull();
    expect(toIsoOrNull(null)).toBeNull();
    expect(toIsoOrNull('2026-10-14T10:00:00Z')).toBe('2026-10-14T10:00:00.000Z');
    const out = selectNewReplies([{ id: 'bad', from: 'a@a.com', receivedAt: 'khong-phai-ngay', body: 'b' }], []);
    expect(out.replies).toHaveLength(1);
    expect(out.replies[0].receivedAt).toBeNull();
  });
});

describe('cs-inbox matchLead — khớp danh sách B2B (HDP-16)', () => {
  const leads = [
    { company: 'ILJIN Display Vina', contact: 'Seungbeom Suh', email: 'seungbeom@iljin.co.kr' },
    { company: 'LS Metal Vina', contact: 'Ms Yến', email: 'yennth@lsmetalvina.biz' },
  ];

  it('khớp chính xác theo email', () => {
    expect(matchLead('seungbeom@iljin.co.kr', leads)?.company).toBe('ILJIN Display Vina');
  });

  it('khớp theo domain khi email khác', () => {
    const hit = matchLead('khac@iljin.co.kr', leads);
    expect(hit?.company).toBe('ILJIN Display Vina');
    expect(hit?.contact).toBeNull();
  });

  it('trả null khi không khớp', () => {
    expect(matchLead('a@unknown.com', leads)).toBeNull();
  });
});

describe('cs-inbox previewText + formatReplyMarkdown (HDP-16)', () => {
  it('cắt ngắn body và bỏ phần trích dẫn lịch sử', () => {
    const body = 'Chào anh,\ntôi quan tâm.\n> On 10 Oct, cs@hdpedu.com wrote:\n> ...';
    const preview = previewText(body, 60);
    expect(preview).not.toContain('On 10 Oct');
    expect(preview.length).toBeLessThanOrEqual(61);
  });

  it('định dạng markdown có đủ dòng cần cho Bán hàng', () => {
    const md = formatReplyMarkdown(
      { id: 'r1', from: 'a@b.com', fromName: 'A', to: 'cs@hdpedu.com', subject: 'Re: Đào tạo', receivedAt: '2026-10-14T10:00:00Z', preview: 'Xin chào', matchedLead: { company: 'ILJIN', contact: null, email: 'a@b.com' } },
      1,
    );
    expect(md).toContain('Re: Đào tạo');
    expect(md).toContain('ILJIN');
    expect(md).toContain('Xin chào');
  });
});

describe('cs-inbox isSelfSent — thư của chính HDP EDU không phải khách trả lời (HDP-20)', () => {
  it('nhận diện domain gốc và mọi domain con của chính mình', () => {
    expect(isSelfSent('cs@hdpedu.com')).toBe(true);
    expect(isSelfSent('cs@reply.hdpedu.com')).toBe(true);
    expect(isSelfSent('HDP EDU <bounce@send.reply.hdpedu.com>')).toBe(true);
  });

  it('không nhận diện nhầm khách thật hoặc domain na ná', () => {
    expect(isSelfSent('seungbeom@iljin.co.kr')).toBe(false);
    expect(isSelfSent('a@hdpedu.com.evil.com')).toBe(false);
    expect(isSelfSent('a@not-hdpedu.com')).toBe(false);
    expect(isSelfSent(null)).toBe(false);
  });

  it('tôn trọng danh sách domain tuỳ chỉnh', () => {
    expect(isSelfSent('a@hdpedu.com', ['other.com'])).toBe(false);
    expect(isSelfSent('a@other.com', ['@other.com'])).toBe(true);
  });
});

describe('cs-inbox selectNewReplies — loại thư tự gửi khỏi hàng đợi khách (HDP-20)', () => {
  it('không đếm thư round-trip của chính mình là "thư mới"', () => {
    const out = selectNewReplies([
      {
        id: 'self-1',
        from: 'cs@hdpedu.com',
        receivedAt: '2026-10-14T11:21:16Z',
        subject: '[HDP-17 round-trip v2] Kiem tra duong doc',
        body: 'Thu kiem chung vong round-trip',
      },
    ]);
    expect(out.replies).toHaveLength(0);
    expect(out.skippedSelfSent).toBe(1);
    // vẫn ghi nhớ id để lần poll sau không lặp lại
    expect(out.seenIds).toContain('self-1');
  });

  it('vẫn giữ khách thật khi trộn lẫn thư tự gửi', () => {
    const out = selectNewReplies([
      { id: 'self-1', from: 'cs@hdpedu.com', receivedAt: '2026-10-14T11:21:16Z', body: 'test' },
      { id: 'cust-1', from: 'seungbeom@iljin.co.kr', receivedAt: '2026-10-14T11:23:32Z', body: 'Cần đào tạo' },
    ]);
    expect(out.replies.map((r) => r.id)).toEqual(['cust-1']);
    expect(out.skippedSelfSent).toBe(1);
  });
});

describe('cs-inbox isAllowedSender — allowlist (HDP-16)', () => {
  it('rỗng = nhận tất cả', () => {
    expect(isAllowedSender('a@b.com', [])).toBe(true);
  });

  it('chặn ngoài allowlist', () => {
    expect(isAllowedSender('a@other.com', ['seungbeom@iljin.co.kr'])).toBe(false);
    expect(isAllowedSender('seungbeom@iljin.co.kr', ['seungbeom@iljin.co.kr'])).toBe(true);
  });

  it('hỗ trợ allowlist theo domain', () => {
    expect(isAllowedSender('khac@iljin.co.kr', ['@iljin.co.kr'])).toBe(true);
  });
});
