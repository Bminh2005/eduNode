export type Lang = "vi" | "en";

export const t = {
  vi: {
    // Header
    tagline: "Công cụ lập bản đồ ý tưởng bằng AI",
    newIdea: "← Ý tưởng mới",

    // Home
    badge: "Trợ lý tư duy bằng AI",
    heroLine1: "Biến mọi ý tưởng thành",
    heroLine2: "lộ trình rõ ràng",
    heroSub:
      "Mô tả ý tưởng của bạn, EduNode sẽ phân tích và tạo ra sơ đồ tư duy cùng lộ trình thực hiện chi tiết.",
    inputPlaceholder: "Mô tả ý tưởng của bạn… (Enter để tạo)",
    generateBtn: "Tạo lộ trình",
    generating: "Đang tạo…",
    tryExample: "Thử ví dụ",

    // Stream steps
    stream1: "Đang phân tích ý tưởng…",
    stream2: "Đang xây dựng đồ thị tri thức…",
    stream3: "Đang xác định các giai đoạn…",
    stream4: "Đang tạo danh sách nhiệm vụ…",
    stream5: "Đang hoàn thiện lộ trình…",

    // Examples
    examples: [
      "Xây dựng ứng dụng huấn luyện thể hình bằng AI",
      "Ra mắt nền tảng SaaS quản lý hóa đơn",
      "Tạo kênh YouTube về tài chính cá nhân",
      "Thiết kế website thương mại điện tử đồ gốm thủ công",
    ],

    // Result sub-header
    ideaLabel: "Ý TƯỞNG",
    tabMindmap: "SƠ ĐỒ TƯ DUY",
    tabRoadmap: "LỘ TRÌNH",
    phasesOverview: "Tổng quan giai đoạn",
    overall: "Tổng tiến độ",
    tasksCompleted: (done: number, total: number) =>
      `${done} / ${total} nhiệm vụ đã hoàn thành`,
    overallProgress: "Tổng tiến độ",
    phaseLabel: (n: number) => `GIAI ĐOẠN ${String(n).padStart(2, "0")}`,
    doneBadge: "XONG",
    noRoadmap: "Không tìm thấy lộ trình.",
    goHome: "Về trang chủ",
    addPlaceholder: "Tên nhiệm vụ mới…",
    addBtnLabel: "Thêm nhiệm vụ",
    hintText: "Cuộn để zoom · Kéo để di chuyển",

    // Phases
    phase1Title: "Nghiên cứu & Khám phá",
    phase1Tasks: [
      "Xác định vấn đề cốt lõi và đối tượng mục tiêu",
      "Phân tích thị trường và đối thủ cạnh tranh",
      "Đánh giá tính khả thi về mặt kỹ thuật",
      "Xác định chỉ số thành công và KPI",
    ],
    phase2TitleDefault: "Thiết kế hệ thống",
    phase2TitleApp: "Thiết kế UX/UI",
    phase2TitleContent: "Chiến lược nội dung",
    phase2TitleAI: "Kiến trúc mô hình AI",
    phase2TasksDefault: [
      "Kiến trúc thông tin và luồng người dùng",
      "Wireframe và nguyên mẫu tương tác",
      "Hệ thống thiết kế và thư viện thành phần",
      "Kiểm tra khả năng sử dụng với người dùng thực",
    ],
    phase2TasksAI: [
      "Thu thập dữ liệu và dán nhãn pipeline",
      "Chọn mô hình và thử nghiệm cơ sở",
      "Chỉ số đánh giá và chuẩn đối sánh",
      "Lập kế hoạch hạ tầng và tài nguyên tính toán",
    ],
    phase2TasksContent: [
      "Persona người dùng và các trụ cột nội dung",
      "Lịch biên tập và tần suất đăng bài",
      "Nghiên cứu từ khóa SEO và tối ưu hóa",
      "Chiến lược phân phối nội dung",
    ],
    phase3Title: "Xây dựng & Triển khai",
    phase3Tasks: [
      "Thiết lập môi trường phát triển và CI/CD",
      "Phát triển tính năng cốt lõi của MVP",
      "Tích hợp dịch vụ bên thứ ba và API",
      "Tối ưu hóa hiệu năng và khả năng mở rộng",
      "Kiểm tra bảo mật và tuân thủ quyền riêng tư dữ liệu",
    ],
    phase4Title: "Kiểm thử & Xác nhận",
    phase4Tasks: [
      "Bộ kiểm thử tự động — đơn vị và tích hợp",
      "Kiểm thử chấp nhận người dùng đầu cuối",
      "Chương trình Beta và thu thập phản hồi",
      "Phân loại lỗi và sprint giải quyết",
    ],
    phase5Title: "Ra mắt & Tăng trưởng",
    phase5Tasks: [
      "Triển khai production và thiết lập giám sát",
      "Thực thi chiến dịch ra mắt thị trường",
      "Bảng phân tích và vòng phản hồi người dùng",
      "Lộ trình lặp sau khi ra mắt",
    ],
  },

  en: {
    tagline: "LLM-powered idea mapper",
    newIdea: "← New Idea",

    badge: "LLM-powered idea mapper",
    heroLine1: "Turn any idea into a",
    heroLine2: "clear roadmap",
    heroSub:
      "Describe your idea and EduNode will break it down into a visual mindmap with phases, tasks, and progress tracking.",
    inputPlaceholder: "Describe your idea here… (Press Enter to generate)",
    generateBtn: "Generate Roadmap",
    generating: "Generating…",
    tryExample: "Try an example",

    stream1: "Analyzing idea structure…",
    stream2: "Mapping knowledge graph…",
    stream3: "Identifying key phases…",
    stream4: "Building subtask tree…",
    stream5: "Finalizing roadmap…",

    examples: [
      "Build an AI-powered fitness coaching app",
      "Launch a SaaS platform for freelance invoicing",
      "Create a YouTube channel about personal finance",
      "Design an e-commerce site for handmade ceramics",
    ],

    ideaLabel: "IDEA",
    tabMindmap: "MINDMAP",
    tabRoadmap: "ROADMAP",
    phasesOverview: "Phases Overview",
    overall: "Overall",
    tasksCompleted: (done: number, total: number) =>
      `${done} of ${total} tasks completed`,
    overallProgress: "Overall Progress",
    phaseLabel: (n: number) => `PHASE ${String(n).padStart(2, "0")}`,
    doneBadge: "DONE",
    noRoadmap: "No roadmap found.",
    goHome: "Go back home",
    addPlaceholder: "New task name…",
    addBtnLabel: "Add task",
    hintText: "Scroll to zoom · Drag to pan",

    phase1Title: "Research & Discovery",
    phase1Tasks: [
      "Define core problem and target audience",
      "Competitive and market landscape mapping",
      "Technical feasibility assessment",
      "Success metrics and KPI definition",
    ],
    phase2TitleDefault: "System Design",
    phase2TitleApp: "UX/UI Design",
    phase2TitleContent: "Content Strategy",
    phase2TitleAI: "Model Architecture",
    phase2TasksDefault: [
      "Information architecture and user flows",
      "Wireframes and interactive prototype",
      "Design system and component library",
      "Usability testing with real users",
    ],
    phase2TasksAI: [
      "Dataset curation and labeling pipeline",
      "Model selection and baseline experiments",
      "Evaluation metrics and benchmarks",
      "Infrastructure and compute planning",
    ],
    phase2TasksContent: [
      "Audience persona and content pillars",
      "Editorial calendar and publishing cadence",
      "SEO keyword research and optimization",
      "Distribution channel strategy",
    ],
    phase3Title: "Build & Implement",
    phase3Tasks: [
      "Development environment and CI/CD pipeline setup",
      "Core MVP feature development",
      "Third-party integrations and APIs",
      "Performance and scalability optimization",
      "Security audit and data privacy compliance",
    ],
    phase4Title: "Test & Validate",
    phase4Tasks: [
      "Automated test suite — unit and integration",
      "End-to-end user acceptance testing",
      "Beta program and feedback collection",
      "Bug triage and resolution sprint",
    ],
    phase5Title: "Launch & Scale",
    phase5Tasks: [
      "Production deployment and monitoring setup",
      "Go-to-market campaign execution",
      "Analytics dashboard and user feedback loops",
      "Post-launch iteration roadmap",
    ],
  },
} as const;
