'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Cpu, Database, Brain, Sparkles, TrendingUp, Globe } from 'lucide-react';

interface TechNews {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: 'ai' | 'data' | 'tech' | 'innovation';
  source: string;
  url: string;
  date: string;
  icon: 'ai' | 'data' | 'tech' | 'trend';
}

// Curated tech news and resources - Updated regularly
const techNewsData: TechNews[] = [
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
  const [news, setNews] = useState<TechNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'data' | 'tech'>('all');

  useEffect(() => {
    // Check if today is odd (Arabic) or even (English)
    const dayOfMonth = new Date().getDate();
    setIsArabic(dayOfMonth % 2 === 1);
    
    // Simulate loading
    setTimeout(() => {
      setNews(techNewsData);
      setLoading(false);
    }, 500);
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
    switch (category) {
      case 'ai':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'data':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tech':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'innovation':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
            <h3 className="font-bold text-gray-900">
              {isArabic ? '🚀 أخبار التقنية والذكاء الاصطناعي' : '🚀 Tech & AI News'}
            </h3>
            <p className="text-xs text-gray-500">
              {isArabic ? 'آخر التحديثات في عالم البيانات' : 'Latest updates in data world'}
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
      {!compact && (
        <div className={`flex gap-2 mb-4 flex-wrap ${isArabic ? 'flex-row-reverse' : ''}`}>
          {[
            { key: 'all', label: isArabic ? 'الكل' : 'All' },
            { key: 'ai', label: isArabic ? 'ذكاء اصطناعي' : 'AI' },
            { key: 'data', label: isArabic ? 'بيانات' : 'Data' },
            { key: 'tech', label: isArabic ? 'تقنية' : 'Tech' },
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key as typeof selectedCategory)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
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
                {getIcon(item.icon)}
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

