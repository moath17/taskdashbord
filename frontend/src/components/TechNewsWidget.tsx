'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Cpu, Database, Brain, Sparkles, TrendingUp, Globe, Building2, Tractor, Stethoscope, GraduationCap, Zap, ShoppingCart, Plane, Dumbbell } from 'lucide-react';
import { getEnabledCategories, NewsCategory } from '../lib/news-preferences';

interface NewsItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  source: string;
  url: string;
  date: string;
  icon?: string;
}

// أخبار متنوعة حسب الفئات - Diverse news by categories
const allNewsData: Record<string, NewsItem[]> = {
  // التقنية
  tech: [
    { id: 'tech1', title: 'Cursor IDE AI Coding Revolution', titleAr: 'ثورة البرمجة الذكية مع Cursor', description: 'AI-powered IDE transforms software development.', descriptionAr: 'بيئة التطوير الذكية تحول تطوير البرمجيات.', category: 'tech', source: 'Cursor', url: 'https://cursor.com', date: '2025-01-28' },
    { id: 'tech2', title: 'Python 3.13 Performance Boost', titleAr: 'تحسين أداء بايثون 3.13', description: 'New Python release brings significant improvements.', descriptionAr: 'إصدار بايثون الجديد يجلب تحسينات كبيرة.', category: 'tech', source: 'Python', url: 'https://python.org', date: '2025-01-20' },
  ],
  ai: [
    { id: 'ai1', title: 'Claude AI Introduces Extended Thinking', titleAr: 'كلود يقدم ميزة التفكير المعمق', description: 'Anthropic releases Claude with extended thinking capabilities.', descriptionAr: 'أنثروبيك تطلق كلود بإمكانيات التفكير المعمق.', category: 'ai', source: 'Anthropic', url: 'https://www.anthropic.com', date: '2025-01-28' },
    { id: 'ai2', title: 'OpenAI GPT-5 Development Updates', titleAr: 'تحديثات تطوير GPT-5', description: 'OpenAI shares insights on next-generation model.', descriptionAr: 'أوبن إيه آي تشارك رؤى حول نموذج الجيل القادم.', category: 'ai', source: 'OpenAI', url: 'https://openai.com', date: '2025-01-25' },
    { id: 'ai3', title: 'Google Gemini 2.0 Multimodal AI', titleAr: 'جوجل جيميني 2.0', description: 'Google unveils Gemini 2.0 with advanced capabilities.', descriptionAr: 'جوجل تكشف عن جيميني 2.0 بقدرات متقدمة.', category: 'ai', source: 'Google', url: 'https://deepmind.google', date: '2025-01-22' },
  ],
  data: [
    { id: 'data1', title: 'Apache Spark 4.0 Released', titleAr: 'إصدار أباتشي سبارك 4.0', description: 'Major update for big data processing.', descriptionAr: 'تحديث رئيسي لمعالجة البيانات الضخمة.', category: 'data', source: 'Apache', url: 'https://spark.apache.org', date: '2025-01-26' },
    { id: 'data2', title: 'Power BI Copilot Now Available', titleAr: 'Power BI Copilot متاح الآن', description: 'AI assistant in Power BI for data analysis.', descriptionAr: 'المساعد الذكي في Power BI لتحليل البيانات.', category: 'data', source: 'Microsoft', url: 'https://powerbi.microsoft.com', date: '2025-01-24' },
  ],
  // الأعمال
  business: [
    { id: 'bus1', title: 'Global Markets Rally in 2025', titleAr: 'ارتفاع الأسواق العالمية في 2025', description: 'Stock markets show strong performance.', descriptionAr: 'أسواق الأسهم تظهر أداءً قوياً.', category: 'business', source: 'Reuters', url: 'https://reuters.com', date: '2025-01-28' },
    { id: 'bus2', title: 'E-commerce Growth Continues', titleAr: 'استمرار نمو التجارة الإلكترونية', description: 'Online retail sees unprecedented growth.', descriptionAr: 'التجارة الإلكترونية تشهد نمواً غير مسبوق.', category: 'business', source: 'Bloomberg', url: 'https://bloomberg.com', date: '2025-01-25' },
  ],
  finance: [
    { id: 'fin1', title: 'Digital Banking Revolution', titleAr: 'ثورة البنوك الرقمية', description: 'Fintech reshaping the banking industry.', descriptionAr: 'التقنية المالية تعيد تشكيل صناعة البنوك.', category: 'finance', source: 'Financial Times', url: 'https://ft.com', date: '2025-01-27' },
  ],
  entrepreneurship: [
    { id: 'ent1', title: 'Startup Funding Hits Record', titleAr: 'تمويل الشركات الناشئة يحقق رقماً قياسياً', description: 'VC investments reach new highs.', descriptionAr: 'استثمارات رأس المال الجريء تصل لمستويات جديدة.', category: 'entrepreneurship', source: 'TechCrunch', url: 'https://techcrunch.com', date: '2025-01-26' },
  ],
  // الزراعة
  agriculture: [
    { id: 'agr1', title: 'Sustainable Farming Practices 2025', titleAr: 'ممارسات الزراعة المستدامة 2025', description: 'New methods for eco-friendly farming.', descriptionAr: 'طرق جديدة للزراعة الصديقة للبيئة.', category: 'agriculture', source: 'AgriNews', url: 'https://agrinews.com', date: '2025-01-28' },
    { id: 'agr2', title: 'Wheat Prices Stabilize', titleAr: 'استقرار أسعار القمح', description: 'Global wheat market shows stability.', descriptionAr: 'سوق القمح العالمي يظهر استقراراً.', category: 'agriculture', source: 'FarmWeek', url: 'https://farmweek.com', date: '2025-01-25' },
  ],
  agritech: [
    { id: 'agt1', title: 'Smart Irrigation Systems', titleAr: 'أنظمة الري الذكية', description: 'IoT transforms water management in farms.', descriptionAr: 'إنترنت الأشياء يحول إدارة المياه في المزارع.', category: 'agritech', source: 'AgTech Weekly', url: 'https://agtechweekly.com', date: '2025-01-27' },
    { id: 'agt2', title: 'Drone Technology in Agriculture', titleAr: 'تقنية الطائرات المسيرة في الزراعة', description: 'Drones revolutionize crop monitoring.', descriptionAr: 'الدرونز تحدث ثورة في مراقبة المحاصيل.', category: 'agritech', source: 'PrecisionAg', url: 'https://precisionag.com', date: '2025-01-24' },
  ],
  livestock: [
    { id: 'liv1', title: 'Livestock Health Monitoring Tech', titleAr: 'تقنية مراقبة صحة الماشية', description: 'Wearables for animal health tracking.', descriptionAr: 'أجهزة قابلة للارتداء لتتبع صحة الحيوانات.', category: 'livestock', source: 'Livestock Weekly', url: 'https://livestockweekly.com', date: '2025-01-26' },
  ],
  // الهندسة والعمارة
  architecture: [
    { id: 'arc1', title: 'Sustainable Architecture Trends', titleAr: 'اتجاهات العمارة المستدامة', description: 'Green building designs gain momentum.', descriptionAr: 'تصاميم المباني الخضراء تكتسب زخماً.', category: 'architecture', source: 'ArchDaily', url: 'https://archdaily.com', date: '2025-01-28' },
    { id: 'arc2', title: 'BIM Technology Advances', titleAr: 'تطورات تقنية BIM', description: 'Building Information Modeling evolution.', descriptionAr: 'تطور نمذجة معلومات البناء.', category: 'architecture', source: 'Dezeen', url: 'https://dezeen.com', date: '2025-01-25' },
  ],
  construction: [
    { id: 'con1', title: '3D Printed Buildings Expand', titleAr: 'توسع المباني المطبوعة ثلاثياً', description: '3D printing revolutionizes construction.', descriptionAr: 'الطباعة ثلاثية الأبعاد تحدث ثورة في البناء.', category: 'construction', source: 'Construction Week', url: 'https://constructionweek.com', date: '2025-01-27' },
  ],
  realestate: [
    { id: 'rel1', title: 'Real Estate Market Outlook 2025', titleAr: 'توقعات سوق العقارات 2025', description: 'Property market trends and forecasts.', descriptionAr: 'اتجاهات وتوقعات سوق العقارات.', category: 'realestate', source: 'PropertyWeek', url: 'https://propertyweek.com', date: '2025-01-26' },
  ],
  // الصحة
  healthcare: [
    { id: 'hea1', title: 'Telemedicine Growth Continues', titleAr: 'استمرار نمو الطب عن بُعد', description: 'Remote healthcare services expand globally.', descriptionAr: 'خدمات الرعاية الصحية عن بُعد تتوسع عالمياً.', category: 'healthcare', source: 'Health News', url: 'https://healthnews.com', date: '2025-01-28' },
    { id: 'hea2', title: 'AI in Medical Diagnosis', titleAr: 'الذكاء الاصطناعي في التشخيص الطبي', description: 'AI improves diagnostic accuracy.', descriptionAr: 'الذكاء الاصطناعي يحسن دقة التشخيص.', category: 'healthcare', source: 'MedTech', url: 'https://medtech.com', date: '2025-01-25' },
  ],
  pharma: [
    { id: 'pha1', title: 'New Drug Approvals 2025', titleAr: 'موافقات الأدوية الجديدة 2025', description: 'FDA approves groundbreaking treatments.', descriptionAr: 'إدارة الغذاء والدواء توافق على علاجات رائدة.', category: 'pharma', source: 'Pharma Times', url: 'https://pharmatimes.com', date: '2025-01-27' },
  ],
  // التعليم
  education: [
    { id: 'edu1', title: 'Digital Learning Transformation', titleAr: 'تحول التعلم الرقمي', description: 'Education embraces technology post-pandemic.', descriptionAr: 'التعليم يتبنى التقنية بعد الجائحة.', category: 'education', source: 'EdWeek', url: 'https://edweek.org', date: '2025-01-28' },
  ],
  edtech: [
    { id: 'edt1', title: 'AI Tutors Gain Popularity', titleAr: 'المعلمون الآليون يكتسبون شعبية', description: 'AI-powered tutoring platforms expand.', descriptionAr: 'منصات التدريس بالذكاء الاصطناعي تتوسع.', category: 'edtech', source: 'EdSurge', url: 'https://edsurge.com', date: '2025-01-26' },
  ],
  // الطاقة والبيئة
  energy: [
    { id: 'ene1', title: 'Renewable Energy Record', titleAr: 'رقم قياسي للطاقة المتجددة', description: 'Solar and wind reach new capacity highs.', descriptionAr: 'الطاقة الشمسية والرياح تصل لمستويات جديدة.', category: 'energy', source: 'Energy News', url: 'https://energynews.com', date: '2025-01-28' },
    { id: 'ene2', title: 'Oil Market Analysis', titleAr: 'تحليل سوق النفط', description: 'Global oil demand trends in 2025.', descriptionAr: 'اتجاهات الطلب العالمي على النفط في 2025.', category: 'energy', source: 'Oil & Gas', url: 'https://oilandgas.com', date: '2025-01-25' },
  ],
  environment: [
    { id: 'env1', title: 'Climate Action Initiatives', titleAr: 'مبادرات العمل المناخي', description: 'Countries accelerate green policies.', descriptionAr: 'الدول تسرع السياسات الخضراء.', category: 'environment', source: 'Climate News', url: 'https://climatenews.com', date: '2025-01-27' },
  ],
  // الترفيه والرياضة
  entertainment: [
    { id: 'ent1', title: 'Streaming Wars Heat Up', titleAr: 'احتدام حروب البث', description: 'Major platforms compete for viewers.', descriptionAr: 'المنصات الكبرى تتنافس على المشاهدين.', category: 'entertainment', source: 'Variety', url: 'https://variety.com', date: '2025-01-28' },
  ],
  sports: [
    { id: 'spo1', title: 'Saudi Pro League Expansion', titleAr: 'توسع الدوري السعودي للمحترفين', description: 'SPL continues to attract global stars.', descriptionAr: 'الدوري السعودي يستمر في جذب النجوم العالميين.', category: 'sports', source: 'Sport360', url: 'https://sport360.com', date: '2025-01-27' },
  ],
  tourism: [
    { id: 'tou1', title: 'Saudi Tourism Vision Progress', titleAr: 'تقدم رؤية السياحة السعودية', description: 'Kingdom welcomes record visitors.', descriptionAr: 'المملكة تستقبل زواراً بأعداد قياسية.', category: 'tourism', source: 'Travel Weekly', url: 'https://travelweekly.com', date: '2025-01-26' },
  ],
  ecommerce: [
    { id: 'eco1', title: 'E-commerce Innovation 2025', titleAr: 'ابتكارات التجارة الإلكترونية 2025', description: 'New technologies reshape online shopping.', descriptionAr: 'تقنيات جديدة تعيد تشكيل التسوق عبر الإنترنت.', category: 'ecommerce', source: 'EcomNews', url: 'https://ecomnews.com', date: '2025-01-28' },
  ],
  saudi: [
    { id: 'sau1', title: 'Vision 2030 Achievements', titleAr: 'إنجازات رؤية 2030', description: 'Saudi Arabia reaches key milestones.', descriptionAr: 'المملكة العربية السعودية تحقق إنجازات رئيسية.', category: 'saudi', source: 'Arab News', url: 'https://arabnews.com', date: '2025-01-28' },
    { id: 'sau2', title: 'NEOM Project Updates', titleAr: 'تحديثات مشروع نيوم', description: 'Latest developments from NEOM.', descriptionAr: 'آخر التطورات من نيوم.', category: 'saudi', source: 'Saudi Gazette', url: 'https://saudigazette.com', date: '2025-01-25' },
  ],
};

// Legacy data for backwards compatibility
const techNewsData: NewsItem[] = [
  {
    id: '1',
    title: 'Claude AI Introduces Extended Thinking',
    titleAr: 'كلود يقدم ميزة التفكير المعمق',
    description: 'Anthropic releases Claude with extended thinking capabilities for complex problem solving.',
    descriptionAr: 'أنثروبيك تطلق كلود بإمكانيات التفكير المعمق لحل المشاكل المعقدة.',
    category: 'ai',
    source: 'Anthropic',
    url: 'https://www.anthropic.com',
    date: '2025-01-05',
    icon: 'ai'
  },
  {
    id: '2',
    title: 'Apache Spark 4.0 Released',
    titleAr: 'إصدار أباتشي سبارك 4.0',
    description: 'Major update brings improved performance and new DataFrame APIs for big data processing.',
    descriptionAr: 'تحديث رئيسي يجلب أداء محسن وواجهات برمجة جديدة لمعالجة البيانات الضخمة.',
    category: 'data',
    source: 'Apache',
    url: 'https://spark.apache.org',
    date: '2025-01-04',
    icon: 'data'
  },
  {
    id: '3',
    title: 'OpenAI GPT-5 Development Updates',
    titleAr: 'تحديثات تطوير GPT-5 من أوبن إيه آي',
    description: 'OpenAI shares insights on next-generation language model capabilities.',
    descriptionAr: 'أوبن إيه آي تشارك رؤى حول قدرات نموذج اللغة الجيل القادم.',
    category: 'ai',
    source: 'OpenAI',
    url: 'https://openai.com',
    date: '2025-01-03',
    icon: 'ai'
  },
  {
    id: '4',
    title: 'Power BI Copilot Now Generally Available',
    titleAr: 'Power BI Copilot متاح الآن للجميع',
    description: 'Microsoft announces general availability of AI assistant in Power BI for data analysis.',
    descriptionAr: 'مايكروسوفت تعلن التوفر العام للمساعد الذكي في Power BI لتحليل البيانات.',
    category: 'data',
    source: 'Microsoft',
    url: 'https://powerbi.microsoft.com',
    date: '2025-01-02',
    icon: 'data'
  },
  {
    id: '5',
    title: 'Google Gemini 2.0 Multimodal AI',
    titleAr: 'جوجل جيميني 2.0 للذكاء الاصطناعي المتعدد',
    description: 'Google unveils Gemini 2.0 with advanced reasoning and multimodal capabilities.',
    descriptionAr: 'جوجل تكشف عن جيميني 2.0 بقدرات التفكير المتقدم والوسائط المتعددة.',
    category: 'ai',
    source: 'Google',
    url: 'https://deepmind.google',
    date: '2025-01-01',
    icon: 'ai'
  },
  {
    id: '6',
    title: 'Snowflake AI Data Cloud Updates',
    titleAr: 'تحديثات سحابة بيانات سنوفليك الذكية',
    description: 'New features for enterprise data management and AI model deployment.',
    descriptionAr: 'ميزات جديدة لإدارة بيانات المؤسسات ونشر نماذج الذكاء الاصطناعي.',
    category: 'data',
    source: 'Snowflake',
    url: 'https://snowflake.com',
    date: '2024-12-30',
    icon: 'data'
  },
  {
    id: '7',
    title: 'Cursor IDE AI Coding Revolution',
    titleAr: 'ثورة البرمجة الذكية مع Cursor',
    description: 'AI-powered IDE transforms software development with intelligent code assistance.',
    descriptionAr: 'بيئة التطوير الذكية تحول تطوير البرمجيات بمساعدة كود ذكية.',
    category: 'tech',
    source: 'Cursor',
    url: 'https://cursor.com',
    date: '2024-12-28',
    icon: 'tech'
  },
  {
    id: '8',
    title: 'Databricks Unity Catalog Enhancements',
    titleAr: 'تحسينات كتالوج الوحدة في داتابريكس',
    description: 'Enhanced data governance and lineage tracking for enterprise analytics.',
    descriptionAr: 'حوكمة بيانات محسنة وتتبع السلالة لتحليلات المؤسسات.',
    category: 'data',
    source: 'Databricks',
    url: 'https://databricks.com',
    date: '2024-12-25',
    icon: 'data'
  },
  {
    id: '9',
    title: 'Meta Llama 3.1 Open Source AI',
    titleAr: 'نموذج ميتا لاما 3.1 مفتوح المصدر',
    description: 'Meta releases powerful open-source language model for commercial use.',
    descriptionAr: 'ميتا تطلق نموذج لغة قوي مفتوح المصدر للاستخدام التجاري.',
    category: 'ai',
    source: 'Meta',
    url: 'https://ai.meta.com',
    date: '2024-12-22',
    icon: 'ai'
  },
  {
    id: '10',
    title: 'Python 3.13 Performance Boost',
    titleAr: 'تحسين أداء بايثون 3.13',
    description: 'New Python release brings significant performance improvements for data science.',
    descriptionAr: 'إصدار بايثون الجديد يجلب تحسينات كبيرة في الأداء لعلم البيانات.',
    category: 'tech',
    source: 'Python',
    url: 'https://python.org',
    date: '2024-12-20',
    icon: 'tech'
  },
];

// Tech resources and learning links
const techResources = [
  { name: 'Kaggle', url: 'https://kaggle.com', icon: '📊' },
  { name: 'Hugging Face', url: 'https://huggingface.co', icon: '🤗' },
  { name: 'Papers With Code', url: 'https://paperswithcode.com', icon: '📄' },
  { name: 'Towards Data Science', url: 'https://towardsdatascience.com', icon: '📈' },
  { name: 'AI News', url: 'https://artificialintelligence-news.com', icon: '🤖' },
];

interface Props {
  compact?: boolean;
}

export default function TechNewsWidget({ compact = false }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState<NewsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Check if today is odd (Arabic) or even (English)
    const dayOfMonth = new Date().getDate();
    setIsArabic(dayOfMonth % 2 === 1);
    
    // Get enabled categories and load news
    const categories = getEnabledCategories();
    setEnabledCategories(categories);
    
    // Collect news from all enabled categories
    const allNews: NewsItem[] = [];
    categories.forEach(cat => {
      const categoryNews = allNewsData[cat.id] || [];
      allNews.push(...categoryNews);
    });
    
    // If no categories enabled, show default tech news
    if (allNews.length === 0) {
      allNews.push(...techNewsData);
    }
    
    // Sort by date
    allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTimeout(() => {
      setNews(allNews);
      setLoading(false);
    }, 300);
  }, []);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'ai':
        return <Brain className="w-4 h-4" />;
      case 'data':
        return <Database className="w-4 h-4" />;
      case 'tech':
        return <Cpu className="w-4 h-4" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ai: 'bg-purple-100 text-purple-700 border-purple-200',
      data: 'bg-blue-100 text-blue-700 border-blue-200',
      tech: 'bg-green-100 text-green-700 border-green-200',
      business: 'bg-amber-100 text-amber-700 border-amber-200',
      finance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      entrepreneurship: 'bg-rose-100 text-rose-700 border-rose-200',
      agriculture: 'bg-lime-100 text-lime-700 border-lime-200',
      agritech: 'bg-teal-100 text-teal-700 border-teal-200',
      livestock: 'bg-orange-100 text-orange-700 border-orange-200',
      architecture: 'bg-slate-100 text-slate-700 border-slate-200',
      construction: 'bg-stone-100 text-stone-700 border-stone-200',
      realestate: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      healthcare: 'bg-red-100 text-red-700 border-red-200',
      pharma: 'bg-pink-100 text-pink-700 border-pink-200',
      education: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      edtech: 'bg-violet-100 text-violet-700 border-violet-200',
      energy: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      environment: 'bg-green-100 text-green-700 border-green-200',
      entertainment: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      sports: 'bg-sky-100 text-sky-700 border-sky-200',
      tourism: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      ecommerce: 'bg-orange-100 text-orange-700 border-orange-200',
      saudi: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(n => n.category === selectedCategory);

  const displayNews = compact ? filteredNews.slice(0, 4) : filteredNews;

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${isArabic ? 'text-right' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
            <Newspaper className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-1 flex-wrap">
              {enabledCategories.slice(0, 3).map(c => c.emoji).join('')}
              {' '}
              {isArabic ? 'آخر الأخبار' : 'Latest News'}
            </h3>
            <p className="text-xs text-gray-500">
              {enabledCategories.length > 0
                ? (isArabic 
                    ? `${enabledCategories.length} فئة مختارة` 
                    : `${enabledCategories.length} categories selected`)
                : (isArabic ? 'آخر التحديثات' : 'Latest updates')
              }
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsArabic(!isArabic)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 text-xs"
          title={isArabic ? 'English' : 'عربي'}
        >
          <Globe className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter */}
      {!compact && enabledCategories.length > 1 && (
        <div className={`flex gap-2 mb-4 flex-wrap ${isArabic ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isArabic ? 'الكل' : 'All'}
          </button>
          {enabledCategories.slice(0, 5).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{isArabic ? cat.nameAr : cat.nameEn}</span>
            </button>
          ))}
        </div>
      )}

      {/* News List */}
      <div className="space-y-3">
        {displayNews.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group ${
              isArabic ? 'text-right' : ''
            }`}
          >
            <div className={`flex items-start gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                {getIcon(item.icon || item.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 mb-1 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
                  <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                    {isArabic ? item.titleAr : item.title}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-600 line-clamp-2" style={isArabic ? { fontFamily: 'Tahoma, Arial, sans-serif' } : {}}>
                  {isArabic ? item.descriptionAr : item.description}
                </p>
                <div className={`flex items-center gap-2 mt-2 text-xs text-gray-400 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
                  <span className={`px-1.5 py-0.5 rounded ${getCategoryColor(item.category)} text-[10px]`}>
                    {item.category.toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{item.source}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Quick Resources */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className={`text-xs font-semibold text-gray-500 mb-2 ${isArabic ? 'text-right' : ''}`}>
            {isArabic ? '📚 مصادر مفيدة' : '📚 Useful Resources'}
          </h4>
          <div className={`flex flex-wrap gap-2 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
            {techResources.map(resource => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>{resource.icon}</span>
                <span>{resource.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* View More Link */}
      {compact && (
        <div className={`mt-4 pt-3 border-t border-gray-100 ${isArabic ? 'text-right' : ''}`}>
          <a 
            href="https://news.ycombinator.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
          >
            {isArabic ? 'المزيد من الأخبار ←' : 'More news →'}
          </a>
        </div>
      )}
    </div>
  );
}

