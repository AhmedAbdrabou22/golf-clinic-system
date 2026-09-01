# الجولف كلينك | Skaya Clinic ERP — Front End

واجهة أمامية (React + Vite + TypeScript) لنظام إدارة عيادة متكامل، مبنية فوق الـ API الموجود في ملف الـ Postman collection.

## المميزات

- **عربي بالكامل + RTL** بدون Sidebar — التنقل بالكامل عبر **Navbar** علوي بقوائم منسدلة مجمّعة (العيادة / المخازن والمشتريات / الإدارة).
- **TanStack Query v5** لكل عمليات الجلب والتعديل.
- **useFetch** و **useMutate**: هوكس عامة مبنية فوق axios + js-cookie بنفس الشكل المطلوب (تحقق تلقائي من `Unauthenticated`, تسجيل خروج تلقائي، رسائل خطأ/نجاح عبر toast، `invalidateKeys` لإعادة تحميل البيانات المرتبطة تلقائيًا بعد كل عملية).
- **تصميم متجاوب (Responsive)** بالكامل من الموبايل وحتى الشاشات الكبيرة.
- هوية بصرية مخصصة (تركوازي طبي هادئ + خط "نبض" Signature داخل الـ Navbar) بدل الألوان الافتراضية الشائعة.

## تشغيل المشروع

```bash
npm install
cp .env.example .env   # ثم عدّل VITE_API_BASE_URL حسب السيرفر عندك
npm run dev
```

المشروع يعمل افتراضيًا على `http://localhost:5173`.

للبناء للإنتاج:

```bash
npm run build
npm run preview
```

## هيكل المشروع (Structure)

```
src/
  hooks/
    useFetch.ts         # هوك عام لكل GET requests
    useMutate.ts         # هوك عام لكل POST / PUT / PATCH / DELETE
  context/
    AuthContext.tsx       # حالة تسجيل الدخول + التوكن
  routes/
    ProtectedRoute.tsx     # يمنع الدخول لأي صفحة بدون تسجيل دخول
    GuestRoute.tsx          # يمنع دخول صفحة اللوجين وأنت مسجل دخول بالفعل
  layouts/
    MainLayout.tsx           # Navbar + مساحة المحتوى (بدون Sidebar)
  components/
    shared/                    # مكونات مشتركة (Modal, DataTable, FormField, ConfirmDialog...)
    auth/ staff/ roles/ departments/ services/ settings/
    suppliers/ items/ purchaseInvoices/
    patients/ appointments/ shifts/ invoices/
                                 # مكون Table + Form Modal لكل CRUD في وحدته
  pages/
    LoginPage.tsx, DashboardPage.tsx, StaffPage.tsx, RolesPage.tsx, ...
                                 # كل صفحة تستدعي مكونات الـ CRUD الخاصة بها + المكونات المشتركة
  types/
    index.ts                  # أنواع TypeScript لكل كيانات الـ API
  utils/
    constants.ts             # روابط الناف بار + قوائم الـ enums (نوع الموظف، حالة الحجز...)
```

## الوحدات المغطاة (حسب الـ Postman Collection)

| الوحدة | Endpoints |
|---|---|
| المصادقة والموظفين | `auth/login`, `auth/me`, `auth/logout`, `auth/roles`, `auth/staff` |
| الإعدادات | `departments`, `services`, `settings` |
| المخازن والمشتريات | `suppliers`, `items`, `purchase-invoices` |
| الاستقبال | `patients`, `appointments` (+status), `shifts/open`, `shifts/{id}/close`, `invoices` (+refund) |

## ملاحظات

- التوكن يُخزَّن في كوكيز باسم `token`، وبيانات المستخدم في `localStorage` باسم `user`.
- أي رد بـ 401 أو برسالة `Unauthenticated.` يحذف الجلسة تلقائيًا ويحوّل المستخدم لصفحة تسجيل الدخول.
- شكل استجابة الـ API متوقع كـ `{ data: [...] }` أو مصفوفة مباشرة — الصفحات تدعم الحالتين.
