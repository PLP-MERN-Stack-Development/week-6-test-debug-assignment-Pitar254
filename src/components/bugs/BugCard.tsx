import React, { useState } from 'react';
import { Bug } from '../../types/bug';
import { bugApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, User, Tag, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { debugLog, debugError } from '../../utils/debug';

interface BugCardProps {
  bug: Bug;
  onSelect?: (bug: Bug) => void;
  onUpdate?: (bug: Bug) => void;
  onDelete?: (bugId: string) => void;
}

export const BugCard: React.FC<BugCardProps> = ({ bug, onSelect, onUpdate, onDelete }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const handleStatusChange = async (newStatus: Bug['status']) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      debugLog(`Updating bug ${bug.id} status to ${newStatus}`);
      
      const updatedBug = await bugApi.update(bug.id, { status: newStatus });
      onUpdate?.(updatedBug);
      debugLog('Bug status updated successfully');
    } catch (error) {
      debugError('Failed to update bug status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || !confirm('Are you sure you want to delete this bug?')) return;

    try {
      setLoading(true);
      debugLog(`Deleting bug ${bug.id}`);
      
      await bugApi.delete(bug.id);
      onDelete?.(bug.id);
      debugLog('Bug deleted successfully');
    } catch (error) {
      debugError('Failed to delete bug', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[bug.priority]}`}>
              {bug.priority.toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[bug.status]}`}>
              {bug.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
            onClick={() => onSelect?.(bug)}
          >
            {bug.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {bug.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(bug.created_at).toLocaleDateString()}</span>
            </div>
            {bug.users && (
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{bug.users.name}</span>
              </div>
            )}
            {bug.tags && bug.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>{bug.tags.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                    Change Status
                  </div>
                  {(['open', 'in-progress', 'resolved', 'closed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusChange(status);
                        setShowMenu(false);
                      }}
                      disabled={loading || bug.status === status}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      {status.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                  <div className="border-t">
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      disabled={loading}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="inline h-4 w-4 mr-2" />
                      Delete Bug
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};