-- ============================================================
-- Supabase: ربط المهام بالأهداف (إجباري عند الإنشاء)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1) Add column goal_id to tasks (nullable for existing rows; new tasks require it via API)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS goal_id uuid REFERENCES goals(id) ON DELETE SET NULL;

-- 2) Optional: add comment
COMMENT ON COLUMN tasks.goal_id IS 'الهدف المرتبط بالمهمة (إجباري عند إنشاء مهمة جديدة)';

-- 3) Optional: create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);

-- بعد التشغيل: تأكد من أن جدول goals موجود وأن الحقل id من نوع uuid.
-- الـ API يفرض اختيار الهدف عند إنشاء مهمة جديدة حتى لو العمود يقبل NULL للبيانات القديمة.
