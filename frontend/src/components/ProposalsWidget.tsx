'use client';

import { useEffect, useState } from 'react';
import { proposalsApi } from '../api/proposals';
import { Proposal } from '../types';
import { Lightbulb, Plus, Trash2, X, Star, ExternalLink, BookOpen, FileText, GraduationCap, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProposalsWidgetProps {
  compact?: boolean;
}

export default function ProposalsWidget({ compact = false }: ProposalsWidgetProps) {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [_loading, setLoading] = useState(true);
  void _loading; // Suppress unused warning, loading state is managed
  const isManager = user?.role === 'manager';

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await proposalsApi.getAll();
      setProposals(data);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    try {
      await proposalsApi.delete(id);
      toast.success('Proposal deleted successfully');
      loadProposals();
      setShowProposalModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete proposal');
    }
  };

  const getTypeIcon = (type: Proposal['type']) => {
    switch (type) {
      case 'course':
        return <GraduationCap className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'instruction':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Proposal['type']) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'article':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'instruction':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Sort: highlighted first, then by date
  const sortedProposals = [...proposals].sort((a, b) => {
    if (a.isHighlighted && !b.isHighlighted) return -1;
    if (!a.isHighlighted && b.isHighlighted) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (compact) {
    // Show only highlighted and recent proposals
    const displayProposals = sortedProposals.slice(0, 5);

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Suggestions & Proposals</h3>
          </div>
          {isManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Add Proposal"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="space-y-3">
          {displayProposals.length === 0 ? (
            <p className="text-sm text-gray-500">No proposals available</p>
          ) : (
            displayProposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => {
                  setSelectedProposal(proposal);
                  setShowProposalModal(true);
                }}
                className={`p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                  proposal.isHighlighted
                    ? 'bg-yellow-50 border-yellow-400 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {proposal.isHighlighted && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      <h4 className="text-sm font-semibold text-gray-900">{proposal.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(proposal.type)} flex items-center gap-1`}>
                        {getTypeIcon(proposal.type)}
                        {proposal.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{proposal.description}</p>
                  </div>
                  {proposal.imageUrl && (
                    <img src={proposal.imageUrl} alt={proposal.title} className="w-16 h-16 object-cover rounded ml-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {showCreateModal && isManager && (
          <CreateProposalModal
            onClose={() => setShowCreateModal(false)}
            onSave={async (data) => {
              try {
                await proposalsApi.create(data);
                toast.success('Proposal created successfully');
                loadProposals();
                setShowCreateModal(false);
              } catch (error: any) {
                toast.error(error.response?.data?.error || 'Failed to create proposal');
              }
            }}
          />
        )}

        {showProposalModal && selectedProposal && (
          <ProposalDetailModal
            proposal={selectedProposal}
            onClose={() => {
              setShowProposalModal(false);
              setSelectedProposal(null);
            }}
            onDelete={isManager ? handleDeleteProposal : undefined}
            onUpdate={isManager ? async (id, data) => {
              try {
                await proposalsApi.update(id, data);
                toast.success('Proposal updated successfully');
                loadProposals();
              } catch (error: any) {
                toast.error(error.response?.data?.error || 'Failed to update proposal');
              }
            } : undefined}
          />
        )}
      </div>
    );
  }

  // Full view (for separate page)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Suggestions & Proposals</h1>
        {isManager && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Proposal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedProposals.map((proposal) => (
          <div
            key={proposal.id}
            onClick={() => {
              setSelectedProposal(proposal);
              setShowProposalModal(true);
            }}
            className={`card cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${
              proposal.isHighlighted ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            {proposal.imageUrl && (
              <img src={proposal.imageUrl} alt={proposal.title} className="w-full h-48 object-cover rounded-t-lg -mx-4 -mt-4 mb-4" />
            )}
            <div className="flex items-center gap-2 mb-2">
              {proposal.isHighlighted && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{proposal.description}</p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(proposal.type)} flex items-center gap-1`}>
                {getTypeIcon(proposal.type)}
                {proposal.type}
              </span>
              {proposal.link && (
                <a
                  href={proposal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && isManager && (
        <CreateProposalModal
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            try {
              await proposalsApi.create(data);
              toast.success('Proposal created successfully');
              loadProposals();
              setShowCreateModal(false);
            } catch (error: any) {
              toast.error(error.response?.data?.error || 'Failed to create proposal');
            }
          }}
        />
      )}

      {showProposalModal && selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          onClose={() => {
            setShowProposalModal(false);
            setSelectedProposal(null);
          }}
          onDelete={isManager ? handleDeleteProposal : undefined}
          onUpdate={isManager ? async (id, data) => {
            try {
              await proposalsApi.update(id, data);
              toast.success('Proposal updated successfully');
              loadProposals();
            } catch (error: any) {
              toast.error(error.response?.data?.error || 'Failed to update proposal');
            }
          } : undefined}
        />
      )}
    </div>
  );
}

function ProposalDetailModal({
  proposal,
  onClose,
  onDelete,
  onUpdate,
}: {
  proposal: Proposal;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<Omit<Proposal, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
}) {
  const [isHighlighted, setIsHighlighted] = useState(proposal.isHighlighted);

  const handleToggleHighlight = async () => {
    if (onUpdate) {
      await onUpdate(proposal.id, { isHighlighted: !isHighlighted });
      setIsHighlighted(!isHighlighted);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            {proposal.isHighlighted && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
            <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {proposal.imageUrl && (
            <img src={proposal.imageUrl} alt={proposal.title} className="w-full h-64 object-cover rounded-lg" />
          )}
          <div>
            <span className="text-sm font-medium text-gray-600">Type: </span>
            <span className="text-sm text-gray-900 capitalize">{proposal.type}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Description: </span>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{proposal.description}</p>
          </div>
          {proposal.link && (
            <div>
              <a
                href={proposal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </a>
            </div>
          )}
          {onUpdate && (
            <div className="pt-4 border-t flex items-center justify-between">
              <button
                onClick={handleToggleHighlight}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isHighlighted ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                } hover:bg-opacity-80`}
              >
                <Star className={`w-4 h-4 ${isHighlighted ? 'fill-yellow-500' : ''}`} />
                {isHighlighted ? 'Unhighlight' : 'Highlight'}
              </button>
              {onDelete && (
                <button onClick={() => onDelete(proposal.id)} className="btn btn-danger flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateProposalModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Omit<Proposal, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'course' as 'course' | 'article' | 'instruction' | 'other',
    imageUrl: '',
    link: '',
    isHighlighted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Create Proposal</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="input"
            >
              <option value="course">Course</option>
              <option value="article">Article</option>
              <option value="instruction">Instruction</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="highlight"
              checked={formData.isHighlighted}
              onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="highlight" className="text-sm text-gray-700">
              Highlight this proposal
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

