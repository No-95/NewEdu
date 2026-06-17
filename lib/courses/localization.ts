import type { Language } from '@/lib/context/LanguageContext';

export type CourseLanguage = 'en' | 'vi' | 'ko';

export function toCourseLanguage(language: string): CourseLanguage {
  if (language === 'vi' || language === 'ko' || language === 'en') {
    return language;
  }
  return 'en';
}

export function getCourseLanguage(language: Language): CourseLanguage {
  return toCourseLanguage(language);
}

export function formatCourseTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export const COURSE_TEXT: Record<
  CourseLanguage,
  {
    catalog: {
      learningHub: string;
      heroTitle: string;
      heroDescription: string;
      publishedCourses: string;
      totalLectures: string;
      accessModel: string;
      free: string;
      mixed: string;
      catalogEyebrow: string;
      catalogTitle: string;
      loading: string;
      teacherTeam: string;
      videosReady: string;
      streaming: string;
      hlsStreaming: string;
      flowTitle: string;
      flowItem1: string;
      flowItem2: string;
      flowItem3: string;
      openDetails: string;
      onlineClassroom: string;
      viewOnlineRooms: string;
      freeBookPromo: string;
      giftBookTag: string;
      progressBadge: string;
      resumeHint: string;
    };
    action: {
      continueCourse: string;
      startCourse: string;
      purchaseCourse: string;
      processing: string;
      signInToPurchase: string;
      purchaseFailed: string;
      createPurchaseFailed: string;
      payosFailed: string;
      giftBookBadge: string;
      claimFreeBook: string;
      giftFormTitle: string;
      giftFormDescription: string;
      giftFullName: string;
      giftPhone: string;
      giftAddress: string;
      giftNote: string;
      giftFullNamePlaceholder: string;
      giftPhonePlaceholder: string;
      giftAddressPlaceholder: string;
      giftNotePlaceholder: string;
      giftSubmit: string;
      giftSubmitting: string;
      giftSuccess: string;
      alreadyClaimedGift: string;
      giftOnceOnly: string;
      signInToClaim: string;
    };
    detail: {
      loading: string;
      totalUnits: string;
      totalVideos: string;
      access: string;
      free: string;
      getStarted: string;
      startTitle: string;
      startDescription: string;
      watchFirst: string;
      jumpLast: string;
      resumeAt: string;
      confirmingPayment: string;
      paymentSuccess: string;
      paymentSyncing: string;
      paymentCancelled: string;
      purchaseIntro: string;
      purchaseLinkLabel: string;
      purchaseOutro: string;
    };
    video: {
      loading: string;
      backToCourse: string;
      hlsStreaming: string;
      unitLabel: string;
      lectureLabel: string;
      course: string;
      currentId: string;
      position: string;
      previousLecture: string;
      nextLecture: string;
      firstLessonMessage: string;
      lastLessonMessage: string;
      descriptionFallback: string;
      purchaseRequired: string;
      unlockCourseFor: string;
    };
    outline: {
      title: string;
      subtitle: string;
      sortedHint: string;
      unitFallbackPrefix: string;
      lecturePrefix: string;
    };
  }
> = {
  en: {
    catalog: {
      learningHub: 'Learning Hub',
      heroTitle: 'Professional Korean Courses for Real Factory Communication',
      heroDescription:
        'Structured units, practical lecture flow, and production-ready HLS video delivery. Pick a course and start learning immediately.',
      publishedCourses: 'Published courses',
      totalLectures: 'Total lectures',
      accessModel: 'Access model',
      free: 'Free',
      mixed: 'Mixed',
      catalogEyebrow: 'Course catalog',
      catalogTitle: 'All published courses',
      loading: 'Loading course data...',
      teacherTeam: 'Teacher: HDP Team',
      videosReady: 'Videos ready',
      streaming: 'Streaming',
      hlsStreaming: 'Cloudflare HLS',
      flowTitle: 'Learning flow',
      flowItem1: 'Unit-structured roadmap',
      flowItem2: 'Practical lecture progression',
      flowItem3: 'Production vocabulary focus',
      openDetails: 'Open course details',
      onlineClassroom: 'Online Classroom',
      viewOnlineRooms: 'View available online classrooms',
      freeBookPromo: 'Free book included with this course',
      giftBookTag: 'Free book',
      progressBadge: '{percent}% complete',
      resumeHint: 'Resume where you left off',
    },
    action: {
      continueCourse: 'Continue with this course',
      startCourse: 'Start course',
      purchaseCourse: 'Purchase this course',
      processing: 'Processing...',
      signInToPurchase: 'Please sign in to purchase',
      purchaseFailed: 'Purchase failed',
      createPurchaseFailed: 'Failed to create purchase',
      payosFailed: 'Failed to start PayOS checkout',
      giftBookBadge: 'Free book',
      claimFreeBook: 'Claim free book',
      giftFormTitle: 'Free book delivery',
      giftFormDescription: 'Enter your shipping details to receive the book included with your course.',
      giftFullName: 'Full name',
      giftPhone: 'Phone number',
      giftAddress: 'Shipping address',
      giftNote: 'Note for delivery (optional)',
      giftFullNamePlaceholder: 'Enter your full name',
      giftPhonePlaceholder: 'Enter your phone number',
      giftAddressPlaceholder: 'Enter your full shipping address',
      giftNotePlaceholder: 'e.g. call before delivery',
      giftSubmit: 'Submit',
      giftSubmitting: 'Submitting...',
      giftSuccess: 'Registered successfully. We will contact you soon to deliver your book.',
      alreadyClaimedGift: 'Book received',
      giftOnceOnly: 'Each account can only register for the free book once.',
      signInToClaim: 'Please sign in to claim your free book',
    },
    detail: {
      loading: 'Loading course...',
      totalUnits: 'Total units',
      totalVideos: 'Total videos',
      access: 'Access',
      free: 'Free',
      getStarted: 'Get started',
      startTitle: 'Start from Unit 1, Lecture 1',
      startDescription:
        'The outline on the right is grouped automatically by Unit and sorted numerically, so Unit 2 always comes before Unit 10.',
      watchFirst: 'Watch first lecture',
      jumpLast: 'Jump to last lecture',
      resumeAt: 'Resume lecture',
      confirmingPayment: 'Confirming your payment…',
      paymentSuccess: 'Payment successful. You now have access to this course.',
      paymentSyncing:
        'Payment received. Access is still syncing — refresh in a moment or contact support if this persists.',
      paymentCancelled:
        'Payment was cancelled. Purchase the course from the courses page to unlock all videos.',
      purchaseIntro: 'Purchase this course from the ',
      purchaseLinkLabel: 'courses page',
      purchaseOutro: ' to unlock all {count} video lessons.',
    },
    video: {
      loading: 'Loading video...',
      backToCourse: 'Back to course page',
      hlsStreaming: 'HLS Streaming',
      unitLabel: 'Unit',
      lectureLabel: 'Lecture',
      course: 'Course',
      currentId: 'Current ID',
      position: 'Position',
      previousLecture: 'Previous lecture',
      nextLecture: 'Next lecture',
      firstLessonMessage: 'This is the first lesson of the course.',
      lastLessonMessage: 'You have reached the final lesson of the course.',
      descriptionFallback:
        'This lesson focuses on practical factory communication, specialized vocabulary, and production workflow scenarios.',
      purchaseRequired: 'Purchase required',
      unlockCourseFor: 'Unlock this course for {price} to watch all video lessons.',
    },
    outline: {
      title: 'Course Outline',
      subtitle: 'Units and lectures',
      sortedHint: 'Lectures are sorted by numeric Unit and Lecture order.',
      unitFallbackPrefix: 'Unit',
      lecturePrefix: 'Lecture',
    },
  },
  vi: {
    catalog: {
      learningHub: 'Trung tâm học tập',
      heroTitle: 'Khóa học tiếng Hàn chuyên nghiệp cho giao tiếp nhà máy',
      heroDescription:
        'Lộ trình theo Unit rõ ràng, nội dung bài học thực tế và streaming HLS sẵn sàng cho triển khai. Chọn khóa học và bắt đầu ngay.',
      publishedCourses: 'Khóa học đã xuất bản',
      totalLectures: 'Tổng số bài học',
      accessModel: 'Hình thức truy cập',
      free: 'Miễn phí',
      mixed: 'Tổng hợp',
      catalogEyebrow: 'Danh mục khóa học',
      catalogTitle: 'Tất cả khóa học đã xuất bản',
      loading: 'Đang tải dữ liệu khóa học...',
      teacherTeam: 'Giảng viên: HDP Team',
      videosReady: 'Video sẵn sàng',
      streaming: 'Nền tảng phát',
      hlsStreaming: 'Cloudflare HLS',
      flowTitle: 'Lộ trình học',
      flowItem1: 'Cấu trúc rõ ràng theo Unit',
      flowItem2: 'Tiến trình bài học thực tiễn',
      flowItem3: 'Tập trung từ vựng sản xuất',
      openDetails: 'Mở chi tiết khóa học',
      onlineClassroom: 'Lớp học trực tuyến',
      viewOnlineRooms: 'Xem các lớp học trực tuyến đang mở',
      freeBookPromo: 'Tặng sách khi mua khóa học này',
      giftBookTag: 'Tặng sách',
      progressBadge: 'Hoàn thành {percent}%',
      resumeHint: 'Tiếp tục từ chỗ bạn dừng lại',
    },
    action: {
      continueCourse: 'Tiếp tục khóa học này',
      startCourse: 'Bắt đầu khóa học',
      purchaseCourse: 'Mua khóa học này',
      processing: 'Đang xử lý...',
      signInToPurchase: 'Vui lòng đăng nhập để mua khóa học',
      purchaseFailed: 'Mua khóa học thất bại',
      createPurchaseFailed: 'Không tạo được đơn mua',
      payosFailed: 'Không khởi tạo được thanh toán PayOS',
      giftBookBadge: 'Tặng Sách',
      claimFreeBook: 'Nhận sách Free',
      giftFormTitle: 'Đăng ký nhận sách tặng',
      giftFormDescription: 'Điền thông tin giao hàng để nhận sách tặng kèm khóa học bạn đã mua.',
      giftFullName: 'Họ và tên',
      giftPhone: 'Số điện thoại',
      giftAddress: 'Địa chỉ nhận hàng',
      giftNote: 'Ghi chú (tùy chọn)',
      giftFullNamePlaceholder: 'Nhập họ và tên',
      giftPhonePlaceholder: 'Nhập số điện thoại',
      giftAddressPlaceholder: 'Nhập địa chỉ nhận hàng chi tiết',
      giftNotePlaceholder: 'Ví dụ: gọi trước khi giao',
      giftSubmit: 'Gửi đăng ký',
      giftSubmitting: 'Đang gửi...',
      giftSuccess: 'Đăng ký nhận sách thành công. Chúng tôi sẽ liên hệ bạn sớm.',
      alreadyClaimedGift: 'Đã nhận sách',
      giftOnceOnly: 'Mỗi tài khoản chỉ được đăng ký nhận sách một lần.',
      signInToClaim: 'Vui lòng đăng nhập để nhận sách',
    },
    detail: {
      loading: 'Đang tải khóa học...',
      totalUnits: 'Tổng số Unit',
      totalVideos: 'Tổng số video',
      access: 'Truy cập',
      free: 'Miễn phí',
      getStarted: 'Bắt đầu',
      startTitle: 'Bắt đầu từ Unit 1, Lecture 1',
      startDescription:
        'Outline bên phải được nhóm tự động theo Unit và sắp xếp theo thứ tự số, vì vậy Unit 2 luôn đứng trước Unit 10.',
      watchFirst: 'Xem bài học đầu tiên',
      jumpLast: 'Đến bài học cuối cùng',
      resumeAt: 'Tiếp tục bài học',
      confirmingPayment: 'Đang xác nhận thanh toán…',
      paymentSuccess: 'Thanh toán thành công. Bạn đã có quyền truy cập khóa học.',
      paymentSyncing:
        'Đã nhận thanh toán. Quyền truy cập đang đồng bộ — vui lòng tải lại trang hoặc liên hệ hỗ trợ nếu vẫn chưa vào được.',
      paymentCancelled:
        'Thanh toán đã hủy. Mua khóa học tại trang khóa học để mở khóa toàn bộ video.',
      purchaseIntro: 'Mua khóa học tại ',
      purchaseLinkLabel: 'trang khóa học',
      purchaseOutro: ' để mở khóa {count} bài video.',
    },
    video: {
      loading: 'Đang tải video...',
      backToCourse: 'Quay lại trang khóa học',
      hlsStreaming: 'HLS Streaming',
      unitLabel: 'Unit',
      lectureLabel: 'Lecture',
      course: 'Khóa học',
      currentId: 'Mã bài học',
      position: 'Vị trí',
      previousLecture: 'Bài trước',
      nextLecture: 'Bài tiếp theo',
      firstLessonMessage: 'Đây là bài đầu tiên của khóa học.',
      lastLessonMessage: 'Bạn đã đến bài cuối cùng của khóa học.',
      descriptionFallback:
        'Nội dung bài học tập trung vào giao tiếp thực tế tại nhà máy, từ vựng chuyên môn và tình huống vận hành.',
      purchaseRequired: 'Cần mua khóa học',
      unlockCourseFor: 'Mua khóa học với giá {price} để xem toàn bộ bài video.',
    },
    outline: {
      title: 'Nội dung khóa học',
      subtitle: 'Danh sách Unit và bài học',
      sortedHint: 'Các bài học được sắp xếp theo thứ tự số Unit và Lecture.',
      unitFallbackPrefix: 'Unit',
      lecturePrefix: 'Lecture',
    },
  },
  ko: {
    catalog: {
      learningHub: '학습 허브',
      heroTitle: '현장 커뮤니케이션 중심의 한국어 실무 과정',
      heroDescription:
        '유닛 기반 학습 구조, 실전형 강의 흐름, 그리고 운영 가능한 HLS 스트리밍을 제공합니다. 지금 과정을 선택하고 시작하세요.',
      publishedCourses: '게시된 코스',
      totalLectures: '총 강의 수',
      accessModel: '이용 방식',
      free: '무료',
      mixed: '혼합',
      catalogEyebrow: '코스 카탈로그',
      catalogTitle: '게시된 모든 강좌',
      loading: '코스 데이터를 불러오는 중입니다...',
      teacherTeam: '강사진: HDP 팀',
      videosReady: '준비된 영상',
      streaming: '스트리밍',
      hlsStreaming: 'Cloudflare HLS',
      flowTitle: '학습 흐름',
      flowItem1: '유닛 기반 학습 로드맵',
      flowItem2: '실무 중심 강의 진행',
      flowItem3: '생산 현장 어휘 집중',
      openDetails: '코스 상세 보기',
      onlineClassroom: '온라인 강의실',
      viewOnlineRooms: '이용 가능한 온라인 강의실 보기',
      freeBookPromo: '이 코스 구매 시 도서 증정',
      giftBookTag: '도서 증정',
      progressBadge: '{percent}% 완료',
      resumeHint: '이어서 학습하기',
    },
    action: {
      continueCourse: '이 강좌 계속하기',
      startCourse: '강좌 시작하기',
      purchaseCourse: '이 강좌 구매하기',
      processing: '처리 중...',
      signInToPurchase: '구매하려면 로그인해 주세요',
      purchaseFailed: '구매에 실패했습니다',
      createPurchaseFailed: '구매 주문을 생성하지 못했습니다',
      payosFailed: 'PayOS 결제를 시작하지 못했습니다',
      giftBookBadge: '도서 증정',
      claimFreeBook: '무료 도서 신청',
      giftFormTitle: '무료 도서 수령 신청',
      giftFormDescription: '코스 구매 시 포함된 도서를 받을 배송 정보를 입력해 주세요.',
      giftFullName: '이름',
      giftPhone: '전화번호',
      giftAddress: '배송 주소',
      giftNote: '메모 (선택)',
      giftFullNamePlaceholder: '이름을 입력하세요',
      giftPhonePlaceholder: '전화번호를 입력하세요',
      giftAddressPlaceholder: '상세 배송 주소를 입력하세요',
      giftNotePlaceholder: '예: 배송 전 연락',
      giftSubmit: '신청하기',
      giftSubmitting: '제출 중...',
      giftSuccess: '신청이 완료되었습니다. 곧 연락드리겠습니다.',
      alreadyClaimedGift: '도서 수령 완료',
      giftOnceOnly: '계정당 무료 도서는 한 번만 신청할 수 있습니다.',
      signInToClaim: '무료 도서를 받으려면 로그인해 주세요',
    },
    detail: {
      loading: '코스를 불러오는 중입니다...',
      totalUnits: '총 유닛',
      totalVideos: '총 영상 수',
      access: '이용 권한',
      free: '무료',
      getStarted: '시작하기',
      startTitle: 'Unit 1, Lecture 1부터 시작',
      startDescription:
        '오른쪽 아웃라인은 Unit 기준으로 자동 그룹화되고 숫자 순으로 정렬되어 Unit 2가 Unit 10보다 먼저 표시됩니다.',
      watchFirst: '첫 강의 보기',
      jumpLast: '마지막 강의로 이동',
      resumeAt: '강의 이어하기',
      confirmingPayment: '결제 확인 중…',
      paymentSuccess: '결제가 완료되었습니다. 이제 코스에 접근할 수 있습니다.',
      paymentSyncing:
        '결제가 접수되었습니다. 접근 권한이 동기화 중입니다. 잠시 후 새로고침하거나 계속되지 않으면 지원팀에 문의하세요.',
      paymentCancelled:
        '결제가 취소되었습니다. 코스 페이지에서 구매하면 모든 영상을 이용할 수 있습니다.',
      purchaseIntro: '코스 페이지에서 ',
      purchaseLinkLabel: '이 강좌를 구매',
      purchaseOutro: '하면 {count}개의 영상 강의를 이용할 수 있습니다.',
    },
    video: {
      loading: '영상을 불러오는 중입니다...',
      backToCourse: '코스 페이지로 돌아가기',
      hlsStreaming: 'HLS 스트리밍',
      unitLabel: 'Unit',
      lectureLabel: 'Lecture',
      course: '코스',
      currentId: '현재 ID',
      position: '진행 위치',
      previousLecture: '이전 강의',
      nextLecture: '다음 강의',
      firstLessonMessage: '이 강의는 코스의 첫 번째 강의입니다.',
      lastLessonMessage: '코스의 마지막 강의에 도달했습니다.',
      descriptionFallback:
        '본 강의는 생산 현장 실무 대화, 전문 어휘, 운영 상황 대응에 중점을 둡니다.',
      purchaseRequired: '구매 필요',
      unlockCourseFor: '{price}에 코스를 구매하면 모든 영상 강의를 시청할 수 있습니다.',
    },
    outline: {
      title: '코스 개요',
      subtitle: '유닛 및 강의 목록',
      sortedHint: '강의는 Unit/Lecture 숫자 순서대로 정렬됩니다.',
      unitFallbackPrefix: 'Unit',
      lecturePrefix: 'Lecture',
    },
  },
};

export const UNIT_TITLES: Record<CourseLanguage, Record<number, string>> = {
  en: {
    1: 'Lesson 1: Planning & Production Control Department',
    2: 'Lesson 2: Incoming Inspection Department',
    3: 'Lesson 3: Metal Stamping Department',
    4: 'Lesson 4: Plastic Injection Molding Department',
    5: 'Lesson 5: SMT (Surface Mount Technology) Department',
    6: 'Lesson 6: Surface Coating Department',
    7: 'Lesson 7: Module Assembly Department',
    8: 'Lesson 8: Process Inspection Department',
    9: 'Lesson 9: Equipment Maintenance Department',
    10: 'Lesson 10: Robot - AI Department',
    11: 'Lesson 11: Product Engineering Department',
    12: 'Lesson 12: Process Engineering Department',
    13: 'Lesson 13: Development Testing Department',
    14: 'Lesson 14: Production Improvement Department',
    15: 'Lesson 15: OQC - Outgoing Quality Inspection Department',
  },
  vi: {
    1: 'Bài 1: Bộ phận kế hoạch và điều tiết sản xuất',
    2: 'Bài 2: Bộ phận kiểm tra đầu vào',
    3: 'Bài 3: Bộ phận dập kim loại',
    4: 'Bài 4: Bộ phận ép nhựa khuôn',
    5: 'Bài 5: Bộ phận SMT (Surface Mount Technology)',
    6: 'Bài 6: Bộ phận sơn phủ bề mặt',
    7: 'Bài 7: Bộ phận lắp ráp Module',
    8: 'Bài 8: Bộ phận kiểm tra công đoạn',
    9: 'Bài 9: Bộ phận bảo trì thiết bị',
    10: 'Bài 10: Bộ phận Robot - AI',
    11: 'Bài 11: Bộ phận kỹ thuật sản phẩm',
    12: 'Bài 12: Bộ phận kỹ thuật công đoạn',
    13: 'Bài 13: Bộ phận thử nghiệm phát triển',
    14: 'Bài 14: Bộ phận cải tiến sản xuất',
    15: 'Bài 15: Bộ phận OQC - Kiểm tra chất lượng đầu ra',
  },
  ko: {
    1: '1과: 생산 계획 및 공정 조정 부서',
    2: '2과: 수입 검사 부서',
    3: '3과: 금속 프레스 부서',
    4: '4과: 사출 성형 부서',
    5: '5과: SMT (Surface Mount Technology) 부서',
    6: '6과: 표면 코팅 부서',
    7: '7과: 모듈 조립 부서',
    8: '8과: 공정 검사 부서',
    9: '9과: 설비 유지보수 부서',
    10: '10과: 로봇 - AI 부서',
    11: '11과: 제품 기술 부서',
    12: '12과: 공정 기술 부서',
    13: '13과: 개발 시험 부서',
    14: '14과: 생산 개선 부서',
    15: '15과: OQC - 출하 품질 검사 부서',
  },
};

export const LECTURE_TITLES: Record<CourseLanguage, Record<number, string>> = {
  en: {
    1: 'Department overview',
    2: 'Specialized vocabulary',
    3: 'Practical dialogue',
    4: 'Issue handling scenarios',
    5: 'Translation practice',
  },
  vi: {
    1: 'Tổng quan về bộ phận',
    2: 'Từ vựng chuyên ngành',
    3: 'Hội thoại thực tế',
    4: 'Các tình huống phát sinh',
    5: 'Luyện dịch',
  },
  ko: {
    1: '부서 개요',
    2: '전문 어휘',
    3: '실전 대화',
    4: '상황 대응 사례',
    5: '번역 연습',
  },
};
