// Dữ liệu testimonial cho HDP EDU.
//
// LƯU Ý: đây là BẢN NHÁP (placeholder) để duyệt bố cục/thẩm mỹ trước.
// Tên, chức danh và câu trích dẫn là ví dụ mẫu — PHẢI thay bằng
// phản hồi thật của học viên (kèm ảnh thật) trước khi công khai.
// Trường `avatar` trống => hiển thị avatar chữ cái theo màu thương hiệu.

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  quote: string;
  rating: number;
  /** Đường dẫn ảnh thật, ví dụ '/testimonials/hung.jpg'. Trống => avatar chữ cái. */
  avatar?: string;
  /** Nhãn kết quả ngắn, ví dụ 'Đỗ phỏng vấn nhà máy'. */
  result?: string;
  verified: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: 'tran-van-hung',
    name: 'Trần Văn Hùng',
    role: 'Công nhân dây chuyền',
    company: 'KCN Thái Nguyên',
    quote:
      'Học hết Unit 3 là mình hiểu sếp nói gì khi giao ca. Trước đây phải nhờ người dịch, giờ tự tin trao đổi trực tiếp với quản lý Hàn.',
    rating: 5,
    result: 'Tự tin giao tiếp khi giao ca',
    verified: true,
  },
  {
    id: 'nguyen-thi-mai',
    name: 'Nguyễn Thị Mai',
    role: 'Tổ trưởng sản xuất',
    company: 'KCN Bắc Ninh',
    quote:
      'Nội dung dạy đúng từ vựng nhà máy, không lan man. Mình học sau ca đêm, mỗi bài 15 phút, ba tuần là nói được câu cơ bản với quản lý Hàn.',
    rating: 5,
    result: 'Học được ngay sau ca đêm',
    verified: true,
  },
  {
    id: 'le-quoc-anh',
    name: 'Lê Quốc Anh',
    role: 'Kỹ thuật viên',
    company: 'Nhà máy Hải Phòng',
    quote:
      'Điểm mạnh là tình huống thật: gọi máy, báo lỗi, an toàn lao động. Mình áp dụng được ngay trong tuần đầu đi làm.',
    rating: 5,
    result: 'Áp dụng ngay tuần đầu',
    verified: true,
  },
];

/** Điểm đánh giá tổng hợp hiển thị phía trên danh sách. */
export const ratingSummary = {
  // NHÁP: cập nhật theo số liệu thật khi có.
  average: 4.9,
  total: 3,
  label: 'Đánh giá từ học viên',
};
