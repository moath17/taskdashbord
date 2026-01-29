'use client';

import { useState, useEffect } from 'react';
import { plansApi } from '../../api';
import { Comment } from '../../types';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlanCommentsProps {
  planId: string;
  planType: 'vacation' | 'training';
}

export default function PlanComments({ planId, planType }: PlanCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [planId]);

  const loadComments = async () => {
    try {
      const plan =
        planType === 'vacation'
          ? await plansApi.getVacationById(planId)
          : await plansApi.getTrainingById(planId);
      setComments(plan.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);

    try {
      const comment =
        planType === 'vacation'
          ? await plansApi.addVacationComment(planId, newComment)
          : await plansApi.addTrainingComment(planId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">
                {comment.user?.name || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          placeholder="Add a comment..."
          className="input flex-1 text-sm"
        />
        <button
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
          className="btn btn-primary flex items-center text-sm"
        >
          <Send className="w-4 h-4 mr-1" />
          Send
        </button>
      </div>
    </div>
  );
}

