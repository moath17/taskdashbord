import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success(t.auth.loginSuccess);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-primary-600"
      >
        <Languages className="w-5 h-5" />
        <span className="font-medium">{language === 'en' ? 'عربي' : 'English'}</span>
      </button>

      <div className="max-w-md w-full">
        <div className="card">
          <h2 className={`text-2xl font-bold text-gray-900 mb-6 text-center`}>{t.auth.login}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? t.auth.loggingIn : t.auth.login}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              {t.auth.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
