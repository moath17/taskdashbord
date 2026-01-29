'use client';

import { useState } from 'react';
import { VacationPlan, PlanStatus } from '../../types';
import { format } from 'date-fns';
import { Plus, MessageSquare, Check, X } from 'lucide-react';
import VacationPlanModal from './VacationPlanModal';
import PlanComments from './PlanComments';

interface VacationPlansProps {
  plans: VacationPlan[];
  onCreate: (plan: Omit<VacationPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  onStatusUpdate?: (type: 'vacation', id: string, status: PlanStatus) => void;
  canApprove: boolean;
}

export default function VacationPlans({
  plans,
  onCreate,
  onStatusUpdate,
  canApprove,
}: VacationPlansProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  // selectedPlan can be used for future edit functionality
  const [_selectedPlan, _setSelectedPlan] = useState<VacationPlan | null>(null);
  void _selectedPlan; void _setSelectedPlan;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Vacation Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          No vacation plans found. Create your first vacation plan!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.type}</h3>
                  {plan.user && (
                    <p className="text-sm text-gray-500">{plan.user.name}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                  {plan.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">From:</span>{' '}
                  {format(new Date(plan.startDate), 'MMM d, yyyy')}
                </div>
                <div>
                  <span className="font-medium">To:</span>{' '}
                  {format(new Date(plan.endDate), 'MMM d, yyyy')}
                </div>
                {plan.notes && (
                  <div>
                    <span className="font-medium">Notes:</span> {plan.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowComments(showComments === plan.id ? null : plan.id)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comments
                </button>
                {canApprove && onStatusUpdate && plan.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onStatusUpdate('vacation', plan.id, 'approved')}
                      className="flex items-center text-sm text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => onStatusUpdate('vacation', plan.id, 'rejected')}
                      className="flex items-center text-sm text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </>
                )}
              </div>

              {showComments === plan.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <PlanComments planId={plan.id} planType="vacation" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <VacationPlanModal
          onClose={() => setIsModalOpen(false)}
          onSave={onCreate}
        />
      )}
    </div>
  );
}

