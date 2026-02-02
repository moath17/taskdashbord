# نصائح الأمان | Security Checklist

## قبل مشاركة المشروع أو نقله

### ✅ تأكد من حذف/تجاهل:
- [ ] `.env.local` - يحتوي JWT_SECRET ومفاتيح خاصة
- [ ] `frontend/data/` - بيانات المستخدمين المحلية
- [ ] `.cursor/` - إعدادات ومخرجات المحرر
- [ ] `node_modules/` - يُعاد تثبيتها بـ `npm install`

### ✅ ملفات مُضمّنة في .gitignore:
هذه الملفات لا تُرفع على Git تلقائياً:
- `.env*` - متغيرات البيئة
- `frontend/data/*.json` - بيانات محلية
- `node_modules/`
- `.next/` - مخرجات البناء
- `.cursor/`

### 🔒 عند التثبيت على جهاز جديد:
1. انسخ `.env.example` إلى `.env.local`
2. ولّد مفتاح JWT جديد: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. لا تشارك ملف `.env.local` أبداً

### 🌐 لا توجد مسارات خاصة بجهاز في الكود
الكود يستخدم:
- `/api` للطلبات الداخلية
- `process.env.NEXT_PUBLIC_APP_URL` للروابط الخارجية
- قيم افتراضية عامة مثل `http://localhost:3000`
