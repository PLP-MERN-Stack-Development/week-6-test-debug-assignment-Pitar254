import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { BugList } from './components/bugs/BugList';
import { BugForm } from './components/bugs/BugForm';
import { StatsCard } from './components/dashboard/StatsCard';
import { Bug, BugStats } from './types/bug';
import { bugApi } from './utils/api';
import { 
  Bug as BugIcon, 
  Plus, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  LogOut,
  User
} from 'lucide-react';
import { debugLog } from './utils/debug';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'bugs' | 'create' | 'stats'>('bugs');
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<BugStats | null>(null);

  React.useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const statsData = await bugApi.getStats();
      setStats(statsData);
      debugLog('Stats fetched successfully:', statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleBugCreated = () => {
    setActiveTab('bugs');
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BugIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Bug Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('bugs')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'bugs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BugIcon className="inline h-4 w-4 mr-2" />
              All Bugs
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus className="inline h-4 w-4 mr-2" />
              Report Bug
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'stats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Statistics
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'bugs' && (
          <BugList 
            onBugSelect={setSelectedBug}
            refreshTrigger={refreshTrigger} 
          />
        )}

        {activeTab === 'create' && (
          <BugForm onSuccess={handleBugCreated} />
        )}

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Bugs"
                value={stats.total}
                icon={BugIcon}
                color="bg-blue-500"
              />
              <StatsCard
                title="Open Issues"
                value={stats.statusBreakdown.open || 0}
                icon={AlertTriangle}
                color="bg-red-500"
              />
              <StatsCard
                title="In Progress"
                value={stats.statusBreakdown['in-progress'] || 0}
                icon={Clock}
                color="bg-yellow-500"
              />
              <StatsCard
                title="Resolved"
                value={stats.statusBreakdown.resolved || 0}
                icon={CheckCircle}
                color="bg-green-500"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {status.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
                    <div key={priority} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{priority}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthScreen: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <BugIcon className="mx-auto h-16 w-16 text-blue-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Bug Tracker</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage bugs efficiently
          </p>
        </div>
        
        {showLogin ? (
          <LoginForm 
            onSwitchToRegister={() => setShowLogin(false)}
          />
        ) : (
          <RegisterForm 
            onSwitchToLogin={() => setShowLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Dashboard /> : <AuthScreen />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;