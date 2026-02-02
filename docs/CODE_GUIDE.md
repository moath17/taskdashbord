# دليل الكود | Code Guide

## 🔐 المصادقة (Authentication)

### lib/auth.ts
- **generateToken()** - ينشئ رمز JWT يحتوي: userId, email, role, organizationId, name, exp
- **verifyToken()** - يتحقق من صحة الرمز وعدم انتهاء صلاحيته
- **hashPassword()** - يشفر كلمة المرور بـ SHA-256
- **requireAuth()** - يفرض وجود مستخدم مسجل دخوله في طلب API

### تدفق تسجيل الدخول
1. المستخدم يرسل email + password لـ `/api/auth/login`
2. الخادم يتحقق ويُرجع token
3. الواجهة تحفظ token في localStorage
4. كل طلب API يرفق `Authorization: Bearer <token>`

---

## 📊 قاعدة البيانات

### التخزين المحلي (بدون Supabase)
- `local-auth-db.ts` - المستخدمون، المنظمات
- `local-db.ts` - المهام، الأهداف، KPIs، الخطط
- `invites-store.ts` - دعوات المستخدمين
- `notifications-store.ts` - الإشعارات

الملفات تُحفظ في `frontend/data/*.json`

### التخزين السحابي (Supabase)
عند ضبط `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` يُستخدم Supabase بدل الملفات المحلية.

---

## 🎭 الأدوار والصلاحيات

### roles.ts
- **owner** - يدير المستخدمين فقط
- **manager** - صلاحيات كاملة تشغيلية
- **employee** - يرى مهامه وأهدافه فقط

### التحقق في API
```typescript
const user = requireAuth(request);        // أي مستخدم مسجل
const user = requireOwnerOrManager(request);  // مالك أو مدير فقط
```

---

## 🌐 الترجمة (i18n)

### LanguageContext
- `language` - 'ar' | 'en'
- `isRTL` - true للعربية
- `toggleLanguage()` - تبديل اللغة

### الاستخدام في المكونات
```typescript
const { isRTL } = useLanguage();
const text = isRTL ? 'النص العربي' : 'English text';
```

---

## 📡 مسارات API الرئيسية

| المسار | الوظيفة |
|--------|---------|
| POST /api/auth/register | تسجيل منظمة جديدة (مالك) |
| POST /api/auth/login | تسجيل دخول |
| GET/POST /api/tasks | المهام |
| GET/POST /api/goals/annual | الأهداف السنوية |
| GET/POST /api/goals/mbo | أهداف MBO |
| GET/POST /api/team | أعضاء الفريق |
| POST /api/invite/set-password | تعيين كلمة مرور من رابط الدعوة |

---

## 🔗 الروابط والـ URLs

جميع الروابط تستخدم متغير البيئة:
- `NEXT_PUBLIC_APP_URL` - عنوان التطبيق (لإرسال روابط البريد والدعوات)
- القيمة الافتراضية للتطوير: `http://localhost:3000`

لا توجد مسارات ثابتة خاصة بأي جهاز في الكود.
