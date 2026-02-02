# هيكل المشروع | Project Structure

## 📁 نظرة عامة

```
project/
├── frontend/                 # تطبيق Next.js الرئيسي
│   ├── src/
│   │   ├── app/              # الصفحات ومسارات API
│   │   ├── api/              # دوال استدعاء API من الواجهة
│   │   ├── components/       # مكونات React قابلة لإعادة الاستخدام
│   │   ├── context/          # سياق التطبيق (المصادقة، اللغة)
│   │   ├── lib/              # مكتبات مساعدة وقاعدة البيانات
│   │   ├── locales/          # ملفات الترجمة (عربي/إنجليزي)
│   │   ├── types/            # تعريفات TypeScript
│   │   ├── utils/            # أدوات مساعدة
│   │   └── views/            # مكونات الصفحات الرئيسية
│   ├── .env.example          # قالب متغيرات البيئة
│   └── package.json
├── docs/                     # التوثيق
├── README.md
├── INSTALL.md
├── DEPLOYMENT.md
└── ROLES_AND_PERMISSIONS.md
```

---

## 📂 المجلدات الرئيسية

### frontend/src/app/
| المسار | الوظيفة |
|--------|---------|
| `(protected)/` | صفحات محمية تتطلب تسجيل دخول |
| `api/` | مسارات API الداخلية (REST) |
| `login/`, `register/` | صفحات المصادقة |
| `forgot-password/`, `reset-password/`, `setup-password/` | استعادة وتعيين كلمة المرور |

### frontend/src/api/
دوال جاهزة لاستدعاء API من الواجهة:
- `auth.ts` - تسجيل الدخول والتسجيل
- `tasks.ts` - إدارة المهام
- `goals.ts` - الأهداف السنوية و MBO
- `kpis.ts` - مؤشرات الأداء
- `plans.ts` - الإجازات والتدريب
- `client.ts` - إعداد axios مع التوكن

### frontend/src/components/
مكونات واجهة المستخدم:
- `Layout.tsx` - الهيكل العام والتنقل
- `tasks/` - Kanban، Calendar، Table
- `plans/` - نماذج الإجازات والتدريب
- `TechNewsWidget.tsx` - أخبار تقنية
- `DailyQuote.tsx` - اقتباس يومي

### frontend/src/lib/
المكتبات الأساسية:
- `auth.ts` - إنشاء وتحقيف JWT
- `database.ts` - اختيار قاعدة البيانات (محلي/Supabase)
- `local-auth-db.ts` - تخزين المستخدمين محلياً
- `local-db.ts` - تخزين المهام والأهداف محلياً
- `roles.ts` - تعريف الأدوار والصلاحيات

### frontend/src/locales/
- `ar.ts` - النصوص العربية
- `en.ts` - النصوص الإنجليزية
- `index.ts` - تصدير الترجمة حسب اللغة

---

## 🔒 ملفات محمية (لا تُرفع على Git)

- `.env.local` - مفاتيح ومتغيرات بيئة خاصة
- `frontend/data/` - بيانات المستخدمين المحلية
- `node_modules/` - الحزم المثبتة
