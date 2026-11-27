import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon, type IconName } from "@/components/ui/Icon";

type Feature = {
  icon: IconName;
  title: string;
  description: string;
  /** Full class names so Tailwind can detect them. */
  tone: string;
};

const FEATURES: Feature[] = [
  {
    icon: "calendar",
    title: "Thời khóa biểu",
    description:
      "Lập lịch học, lịch làm theo tuần. Môn học cố định tự lặp lại, không phải nhập lại.",
    tone: "bg-teal-50 text-teal-600",
  },
  {
    icon: "check",
    title: "Công việc & tiến độ",
    description: "Ghi lại việc cần làm, đánh dấu hoàn thành và xem bạn đã đi được bao xa.",
    tone: "bg-brand-50 text-brand-600",
  },
  {
    icon: "bell",
    title: "Nhắc nhở đúng lúc",
    description: "Nhận thông báo trước giờ học, giờ họp hay hạn nộp để không bỏ lỡ việc gì.",
    tone: "bg-amber-50 text-amber-600",
  },
  {
    icon: "shield",
    title: "Chế độ tập trung",
    description: "Tạm chặn mạng xã hội và trang web gây xao nhãng trong khung giờ bạn chọn.",
    tone: "bg-rose-50 text-rose-600",
  },
];

const TODAY = [
  { time: "07:30", title: "Toán cao cấp", tone: "border-teal-400 bg-teal-50" },
  { time: "09:30", title: "Ôn từ vựng tiếng Anh", tone: "border-brand-400 bg-brand-50" },
  { time: "14:00", title: "Làm báo cáo nhóm", tone: "border-amber-400 bg-amber-50" },
  { time: "20:00", title: "Tập trung: chặn mạng xã hội", tone: "border-rose-400 bg-rose-50" },
];

const STEPS = [
  { title: "Lập lịch", description: "Thêm lịch học, lịch làm và các việc cần xong trong tuần." },
  { title: "Bật tập trung", description: "Chọn khung giờ và những trang web cần tạm chặn." },
  {
    title: "Theo dõi tiến độ",
    description: "Xem việc đã xong, việc còn lại và giữ nhịp mỗi ngày.",
  },
];

function TodayPreview() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-xl shadow-brand-900/5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Hôm nay</p>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Thứ Hai
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {TODAY.map((item) => (
          <li
            key={item.time}
            className={`flex gap-3 rounded-xl border-l-4 px-3 py-2.5 ${item.tone}`}
          >
            <span className="w-12 shrink-0 text-sm font-semibold text-ink-muted">{item.time}</span>
            <span className="text-sm font-medium">{item.title}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">Tiến độ hôm nay</span>
          <span className="font-semibold text-brand-700">3/5 việc</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100">
          <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-brand-500 to-teal-400" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              Lịch trình · Nhắc nhở · Tập trung
            </p>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
              Giữ nhịp học tập và làm việc <span className="text-brand-600">mỗi ngày</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              STAYON giúp bạn lập thời khóa biểu, nhắc việc đúng lúc, theo dõi tiến độ và tạm chặn
              những trang web gây xao nhãng theo khung giờ bạn chọn.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register" size="lg">
                Bắt đầu miễn phí
                <Icon name="arrowRight" className="size-4" />
              </ButtonLink>
              <ButtonLink href="#features" variant="secondary" size="lg">
                Xem tính năng
              </ButtonLink>
            </div>
          </div>
          <TodayPreview />
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-20 border-t border-line bg-surface py-16 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Mọi thứ bạn cần để tập trung
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-ink-muted">
              Bốn công cụ trong một nơi, đơn giản đủ để ai cũng dùng được.
            </p>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-2xl border border-line bg-canvas p-6 transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
                >
                  <span className={`grid size-11 place-items-center rounded-xl ${feature.tone}`}>
                    <Icon name={feature.icon} className="size-6" />
                  </span>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight">Bắt đầu trong 3 bước</h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-surface p-6">
                <span className="grid size-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <ButtonLink href="/register" size="lg">
              Tạo tài khoản miễn phí
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
