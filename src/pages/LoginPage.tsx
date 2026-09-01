import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-primary-900 px-4 py-10">
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    />
    <div className="relative w-full max-w-md">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">

        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">الجولف كلينك</h1>
          <p className="mt-1 text-sm text-white/60">نظام إدارة العيادات المتكامل</p>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="font-display text-lg font-bold text-ink">تسجيل الدخول</h2>
          <p className="mt-1 text-sm text-ink/50">أدخل بيانات حسابك للمتابعة</p>
        </div>
        <LoginForm />
      </div>

      <svg
        className="pulse-line mt-6 opacity-30"
        viewBox="0 0 1200 34"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 17 H430 L455 4 L478 30 L500 10 L520 17 H770 L795 4 L818 30 L840 10 L860 17 H1200"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    </div>
  </div>
);

export default LoginPage;
