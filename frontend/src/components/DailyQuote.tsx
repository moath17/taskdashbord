import { Quote, Sparkles } from 'lucide-react';

interface QuoteItem {
  text: string;
  lang: 'ar' | 'en';
  author?: string;
}

const motivationalQuotes: QuoteItem[] = [
  // Arabic Quotes
  { text: "النجاح ليس نهائياً والفشل ليس قاتلاً، الشجاعة للاستمرار هي ما يهم", lang: 'ar', author: "ونستون تشرشل" },
  { text: "لا تنتظر الفرصة، اصنعها بنفسك", lang: 'ar' },
  { text: "من جد وجد ومن زرع حصد", lang: 'ar' },
  { text: "الإرادة تصنع المعجزات", lang: 'ar' },
  { text: "أنا لا أفشل، أنا أجد طرقاً لا تنجح", lang: 'ar', author: "توماس إديسون" },
  { text: "كن أنت التغيير الذي تريد أن تراه في العالم", lang: 'ar', author: "غاندي" },
  { text: "الإبداع هو الذكاء وهو يستمتع", lang: 'ar', author: "ألبرت آينشتاين" },
  { text: "لا يوجد طريق للسعادة، السعادة هي الطريق", lang: 'ar' },
  { text: "العقول الكبيرة تناقش الأفكار، والعقول المتوسطة تناقش الأحداث، والعقول الصغيرة تناقش الناس", lang: 'ar' },
  { text: "إذا لم تستطع الطيران فاركض، وإذا لم تستطع الركض فامشِ", lang: 'ar', author: "مارتن لوثر كينغ" },
  { text: "الصبر مفتاح الفرج", lang: 'ar' },
  { text: "ابدأ من حيث أنت، واستخدم ما لديك، وافعل ما تستطيع", lang: 'ar' },
  { text: "النجاح يأتي لمن يعمل بجد ويؤمن بحلمه", lang: 'ar' },
  { text: "لا تستسلم، البداية دائماً الأصعب", lang: 'ar' },
  { text: "طريق الألف ميل يبدأ بخطوة واحدة", lang: 'ar', author: "لاو تزو" },
  
  // English Quotes
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts", lang: 'en', author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do", lang: 'en', author: "Steve Jobs" },
  { text: "Don't wait for the perfect moment, start where you are", lang: 'en' },
  { text: "Believe you can and you're halfway there", lang: 'en', author: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams", lang: 'en', author: "Eleanor Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard", lang: 'en', author: "Tim Notke" },
  { text: "Innovation distinguishes between a leader and a follower", lang: 'en', author: "Steve Jobs" },
  { text: "Great things never come from comfort zones", lang: 'en' },
  { text: "Dream bigger. Do bigger", lang: 'en' },
  { text: "Wake up with determination. Go to bed with satisfaction", lang: 'en' },
  { text: "Do something today that your future self will thank you for", lang: 'en' },
  { text: "The key to success is to focus on goals, not obstacles", lang: 'en' },
  { text: "Your mind is a powerful thing. Fill it with positive thoughts", lang: 'en' },
  { text: "Success is walking from failure to failure with no loss of enthusiasm", lang: 'en', author: "Winston Churchill" },
  { text: "The only person you should try to be better than is the person you were yesterday", lang: 'en' },
];

export default function DailyQuote() {
  // Get quote based on the day of the year (0-364)
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % motivationalQuotes.length;
  const todayQuote = motivationalQuotes[quoteIndex];
  
  const isArabic = todayQuote.lang === 'ar';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden transition-all duration-200 ease-out hover:shadow-md ${
      isArabic ? 'border-r-4 border-r-sky-500' : 'border-l-4 border-l-sky-500'
    }`}>
      <div className={`flex items-start gap-4 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
        <div className="rounded-full p-3 flex-shrink-0 bg-sky-50">
          <Sparkles className="w-6 h-6 text-sky-600" />
        </div>
        <div className="flex-1">
          <div className={`flex items-center gap-2 mb-2 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
            <Quote className={`w-4 h-4 text-sky-500 ${isArabic ? 'rotate-180' : ''}`} />
            <h3 className="text-sm font-bold text-gray-900">
              {isArabic ? '✨ إلهام اليوم' : '✨ Daily Inspiration'}
            </h3>
          </div>
          <p className={`text-base leading-relaxed font-medium text-gray-700 ${isArabic ? 'text-lg' : 'italic'}`} style={isArabic ? { fontFamily: 'Tahoma, Arial, sans-serif' } : {}}>
            "{todayQuote.text}"
          </p>
          {todayQuote.author && (
            <p className="text-xs mt-2 text-sky-600">
              — {todayQuote.author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
