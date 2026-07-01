const STATS = [
  { value: "1,000+", label: "websites powered" },
  { value: "60s", label: "to go live" },
  { value: "24/7", label: "instant answers" },
  { value: "1 line", label: "of code to install" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 divide-gray-100 py-10 sm:grid-cols-4 sm:divide-x">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center px-4 py-4 text-center"
            >
              <span
                className="font-medium tracking-[-0.02em] text-gray-900"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
              >
                {s.value}
              </span>
              <span className="mt-1 text-[12px] text-gray-500 sm:text-[13px]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
