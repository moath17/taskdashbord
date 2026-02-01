/**
 * News Preferences - حفظ تفضيلات الأخبار
 * Stores owner's news category preferences in localStorage
 */

export interface NewsCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  emoji: string;
  keywords: string[];
  enabled: boolean;
}

// جميع فئات الأخبار المتاحة
export const NEWS_CATEGORIES: NewsCategory[] = [
  // التقنية
  { id: 'tech', nameEn: 'Technology', nameAr: 'التقنية', emoji: '💻', keywords: ['tech', 'software', 'startup'], enabled: true },
  { id: 'ai', nameEn: 'Artificial Intelligence', nameAr: 'الذكاء الاصطناعي', emoji: '🤖', keywords: ['AI', 'machine learning', 'deep learning'], enabled: true },
  { id: 'data', nameEn: 'Data Science', nameAr: 'علم البيانات', emoji: '📊', keywords: ['data', 'analytics', 'big data'], enabled: true },
  
  // الأعمال
  { id: 'business', nameEn: 'Business', nameAr: 'الأعمال', emoji: '💼', keywords: ['business', 'economy', 'market'], enabled: false },
  { id: 'finance', nameEn: 'Finance', nameAr: 'المالية', emoji: '💰', keywords: ['finance', 'banking', 'investment'], enabled: false },
  { id: 'entrepreneurship', nameEn: 'Entrepreneurship', nameAr: 'ريادة الأعمال', emoji: '🚀', keywords: ['startup', 'entrepreneur', 'venture'], enabled: false },
  
  // الزراعة
  { id: 'agriculture', nameEn: 'Agriculture', nameAr: 'الزراعة', emoji: '🌾', keywords: ['agriculture', 'farming', 'crops'], enabled: false },
  { id: 'agritech', nameEn: 'AgriTech', nameAr: 'التقنية الزراعية', emoji: '🚜', keywords: ['agritech', 'smart farming', 'precision agriculture'], enabled: false },
  { id: 'livestock', nameEn: 'Livestock', nameAr: 'الثروة الحيوانية', emoji: '🐄', keywords: ['livestock', 'cattle', 'poultry'], enabled: false },
  
  // الهندسة والعمارة
  { id: 'architecture', nameEn: 'Architecture', nameAr: 'العمارة', emoji: '🏛️', keywords: ['architecture', 'design', 'building'], enabled: false },
  { id: 'construction', nameEn: 'Construction', nameAr: 'البناء', emoji: '🏗️', keywords: ['construction', 'engineering', 'infrastructure'], enabled: false },
  { id: 'realestate', nameEn: 'Real Estate', nameAr: 'العقارات', emoji: '🏠', keywords: ['real estate', 'property', 'housing'], enabled: false },
  
  // الصحة
  { id: 'healthcare', nameEn: 'Healthcare', nameAr: 'الرعاية الصحية', emoji: '🏥', keywords: ['healthcare', 'medical', 'health'], enabled: false },
  { id: 'pharma', nameEn: 'Pharmaceutical', nameAr: 'الأدوية', emoji: '💊', keywords: ['pharma', 'drugs', 'medicine'], enabled: false },
  
  // التعليم
  { id: 'education', nameEn: 'Education', nameAr: 'التعليم', emoji: '📚', keywords: ['education', 'learning', 'school'], enabled: false },
  { id: 'edtech', nameEn: 'EdTech', nameAr: 'تقنية التعليم', emoji: '🎓', keywords: ['edtech', 'e-learning', 'online courses'], enabled: false },
  
  // الطاقة والبيئة
  { id: 'energy', nameEn: 'Energy', nameAr: 'الطاقة', emoji: '⚡', keywords: ['energy', 'oil', 'gas', 'renewable'], enabled: false },
  { id: 'environment', nameEn: 'Environment', nameAr: 'البيئة', emoji: '🌍', keywords: ['environment', 'sustainability', 'climate'], enabled: false },
  
  // الترفيه والإعلام
  { id: 'entertainment', nameEn: 'Entertainment', nameAr: 'الترفيه', emoji: '🎬', keywords: ['entertainment', 'movies', 'gaming'], enabled: false },
  { id: 'sports', nameEn: 'Sports', nameAr: 'الرياضة', emoji: '⚽', keywords: ['sports', 'football', 'fitness'], enabled: false },
  
  // السياحة والسفر
  { id: 'tourism', nameEn: 'Tourism', nameAr: 'السياحة', emoji: '✈️', keywords: ['tourism', 'travel', 'hospitality'], enabled: false },
  
  // التجارة الإلكترونية
  { id: 'ecommerce', nameEn: 'E-Commerce', nameAr: 'التجارة الإلكترونية', emoji: '🛒', keywords: ['ecommerce', 'retail', 'shopping'], enabled: false },
  
  // السعودية
  { id: 'saudi', nameEn: 'Saudi Arabia', nameAr: 'السعودية', emoji: '🇸🇦', keywords: ['saudi', 'vision 2030', 'KSA'], enabled: false },
];

const STORAGE_KEY = 'news_preferences';

export function getNewsPreferences(): NewsCategory[] {
  if (typeof window === 'undefined') {
    return NEWS_CATEGORIES;
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedCategories = JSON.parse(saved) as { id: string; enabled: boolean }[];
      return NEWS_CATEGORIES.map(cat => ({
        ...cat,
        enabled: savedCategories.find(s => s.id === cat.id)?.enabled ?? cat.enabled,
      }));
    }
  } catch (e) {
    console.error('Failed to load news preferences:', e);
  }
  
  return NEWS_CATEGORIES;
}

export function saveNewsPreferences(categories: NewsCategory[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const toSave = categories.map(c => ({ id: c.id, enabled: c.enabled }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save news preferences:', e);
  }
}

export function getEnabledCategories(): NewsCategory[] {
  return getNewsPreferences().filter(c => c.enabled);
}
