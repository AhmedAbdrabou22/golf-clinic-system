import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-center px-4">
    <span className="font-display text-6xl font-extrabold text-primary-500">404</span>
    <h1 className="font-display text-xl font-bold text-ink">الصفحة غير موجودة</h1>
    <p className="text-sm text-ink/50">الرابط الذي تحاول الوصول إليه غير متاح.</p>
    <Link to="/" className="btn-primary">
      العودة للرئيسية
    </Link>
  </div>
);

export default NotFoundPage;
