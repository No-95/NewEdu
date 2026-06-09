/**
 * Smoke test: POST /api/books/order (use with dev server or production URL).
 * Usage: node --env-file=.env.local scripts/test-book-order-api.mjs
 *        BOOK_ORDER_TEST_BASE=https://hdpedu.com node scripts/test-book-order-api.mjs
 */
const base = (process.env.BOOK_ORDER_TEST_BASE || 'http://localhost:3000').replace(/\/+$/, '');
const url = `${base}/api/books/order`;

const payload = {
  fullName: 'Nguyễn Văn Test',
  phone: '0901234567',
  address: '123 Đường Test, Quận 1, TP.HCM',
  note: 'Gọi trước khi giao (kiểm thử API)',
};

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log('status', res.status);
console.log(text);
