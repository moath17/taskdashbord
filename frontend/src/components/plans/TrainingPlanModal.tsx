'use client';

import { useState, useMemo } from 'react';
import { TrainingPlan } from '../../types';
import { X } from 'lucide-react';

interface TrainingPlanModalProps {
  onClose: () => void;
  onSave: (plan: Omit<TrainingPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
}

export default function TrainingPlanModal({ onClose, onSave }: TrainingPlanModalProps) {
  const [formData, setFormData] = useState({
    courseName: '',
    platform: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Calculate duration automatically from start and end dates
  const calculatedDuration = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return '';
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      return '';
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    
    if (diffDays === 1) {
      return '1 day';
    } else if (diffDays < 7) {
      return `${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      if (remainingDays === 0) {
        return weeks === 1 ? '1 week' : `${weeks} weeks`;
      } else {
        return `${weeks} week${weeks > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      }
    } else {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      if (remainingDays === 0) {
        return months === 1 ? '1 month' : `${months} months`;
      } else {
        return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that dates are provided
    if (!formData.startDate || !formData.endDate) {
      alert('Please enter start and end dates');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      alert('End date must be after start date');
      return;
    }

    setLoading(true);
    onSave({
      ...formData,
      duration: calculatedDuration,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">New Training Plan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input
              type="text"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform / Institution</label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
                required
                min={formData.startDate}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Auto-calculated)</label>
            <input
              type="text"
              value={calculatedDuration || 'Will be calculated automatically after entering dates'}
              className="input bg-gray-50"
              readOnly
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Expectations</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Optional notes or expectations..."
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

