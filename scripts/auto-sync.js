/**
 * مراقبة التعديلات والمزامنة التلقائية مع GitHub
 * عند حفظ أي ملف يتم إرسال التعديلات تلقائياً
 */

const { execSync } = require('child_process');
const path = require('path');
const chokidar = require('chokidar');

const ROOT = path.join(__dirname, '..');
const DEBOUNCE_MS = 3000; // انتظار 3 ثواني بعد آخر تعديل
let debounceTimer = null;

// مجلدات وملفات للمراقبة (تتجاهل node_modules و .git)
const WATCH_PATHS = [
  path.join(ROOT, 'frontend/src'),
  path.join(ROOT, 'backend/src'),
  path.join(ROOT, 'frontend', '*.js'),
  path.join(ROOT, 'frontend', '*.json'),
  path.join(ROOT, 'backend', '*.json'),
  path.join(ROOT, '*.md'),
  path.join(ROOT, '*.json')
];

function run(cmd, silent = false) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (e) {
    if (!silent) console.error(e.message);
    return null;
  }
}

function syncToGitHub() {
  console.log('\n📤 مزامنة التعديلات مع GitHub...');
  
  const status = run('git status --short', true);
  if (!status || status.trim() === '') {
    console.log('✓ لا توجد تعديلات جديدة');
    return;
  }

  const timestamp = new Date().toLocaleString('ar-SA');
  run('git add .');
  run(`git commit -m "Auto-sync: ${timestamp}"`);
  const pushResult = run('git push origin main');
  
  if (pushResult !== null) {
    console.log('✅ تم رفع التعديلات إلى GitHub بنجاح!\n');
  } else {
    console.log('⚠️ فشل الرفع - تحقق من اتصال الإنترنت أو صلاحيات Git\n');
  }
}

function scheduleSync() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    syncToGitHub();
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

console.log('👀 مراقبة التعديلات... (احفظ الملفات وسيتم الرفع تلقائياً بعد 3 ثوانٍ)\n');
console.log('المجلدات المراقبة: frontend/src, backend/src');
console.log('اضغط Ctrl+C للإيقاف\n');

chokidar.watch(WATCH_PATHS, {
  ignored: /node_modules|\.git|dist|build|\.next/,
  ignoreInitial: true,
  persistent: true
}).on('change', (filePath) => {
  const relative = path.relative(ROOT, filePath);
  console.log(`📝 تم تعديل: ${relative}`);
  scheduleSync();
}).on('add', (filePath) => {
  const relative = path.relative(ROOT, filePath);
  console.log(`➕ ملف جديد: ${relative}`);
  scheduleSync();
});
