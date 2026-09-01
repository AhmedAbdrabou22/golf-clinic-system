const Loader = ({ label = "جاري التحميل..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/50">
    <span className="relative flex h-10 w-10">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-40" />
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-bold">
        +
      </span>
    </span>
    <p className="text-sm font-bold">{label}</p>
  </div>
);

export default Loader;
