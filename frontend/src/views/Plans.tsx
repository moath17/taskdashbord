'use client';

import { useState, useEffect } from 'react';
import { plansApi } from '../api';
import { VacationPlan, TrainingPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import VacationPlans from '../components/plans/VacationPlans';
import TrainingPlans from '../components/plans/TrainingPlans';
import { Calendar, BookOpen } from 'lucide-react';

export default function Plans() {
  const [activeTab, setActiveTab] = useState<'vacation' | 'training'>('vacation');
  const [vacationPlans, setVacationPlans] = useState<VacationPlan[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const [vacations, trainings] = await Promise.all([
        plansApi.getVacations(),
        plansApi.getTrainings(),
      ]);
      setVacationPlans(vacations);
      setTrainingPlans(trainings);
    } catch (error) {
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleVacationCreate = async (plan: Omit<VacationPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPlan = await plansApi.createVacation(plan);
      setVacationPlans([...vacationPlans, newPlan]);
      toast.success(t.plans.vacationCreated);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const handleTrainingCreate = async (plan: Omit<TrainingPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPlan = await plansApi.createTraining(plan);
      setTrainingPlans([...trainingPlans, newPlan]);
      toast.success(t.plans.trainingCreated);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const handleStatusUpdate = async (type: 'vacation' | 'training', id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      if (type === 'vacation') {
        const updated = await plansApi.updateVacationStatus(id, status);
        setVacationPlans(vacationPlans.map((p) => (p.id === id ? updated : p)));
      } else {
        const updated = await plansApi.updateTrainingStatus(id, status);
        setTrainingPlans(trainingPlans.map((p) => (p.id === id ? updated : p)));
      }
      toast.success(t.messages.updated);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const canApprove = user?.role === 'manager';

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <h1 className="text-3xl font-bold text-gray-900">{t.plans.title}</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className={`flex ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
          <button
            onClick={() => setActiveTab('vacation')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vacation'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Calendar className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.plans.vacationPlans}
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'training'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <BookOpen className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.plans.trainingPlans}
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">{t.app.loading}</div>
      ) : (
        <>
          {activeTab === 'vacation' && (
            <VacationPlans
              plans={vacationPlans}
              onCreate={handleVacationCreate}
              onStatusUpdate={canApprove ? handleStatusUpdate : undefined}
              canApprove={canApprove}
            />
          )}
          {activeTab === 'training' && (
            <TrainingPlans
              plans={trainingPlans}
              onCreate={handleTrainingCreate}
              onStatusUpdate={canApprove ? handleStatusUpdate : undefined}
              canApprove={canApprove}
            />
          )}
        </>
      )}
    </div>
  );
}
