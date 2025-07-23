import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BugCard } from '../bugs/BugCard';
import { Bug } from '../../types/bug';
import { useAuth } from '../../hooks/useAuth';
import { bugApi } from '../../utils/api';

// Mock dependencies
jest.mock('../../hooks/useAuth');
jest.mock('../../utils/api');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockBugApi = bugApi as jest.Mocked<typeof bugApi>;

const mockBug: Bug = {
  id: '1',
  title: 'Test Bug',
  description: 'This is a test bug description',
  priority: 'high',
  status: 'open',
  reporter_id: 'user1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  users: {
    name: 'John Doe',
    email: 'john@example.com',
  },
};

describe('BugCard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders bug information correctly', () => {
    render(<BugCard bug={mockBug} />);

    expect(screen.getByText('Test Bug')).toBeInTheDocument();
    expect(screen.getByText('This is a test bug description')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onSelect when title is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<BugCard bug={mockBug} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText('Test Bug'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockBug);
  });

  it('shows menu when authenticated', () => {
    render(<BugCard bug={mockBug} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    expect(screen.getByText('Change Status')).toBeInTheDocument();
  });

  it('updates bug status when status option is clicked', async () => {
    const mockOnUpdate = jest.fn();
    const updatedBug = { ...mockBug, status: 'in-progress' as const };
    
    mockBugApi.update.mockResolvedValue(updatedBug);
    
    render(<BugCard bug={mockBug} onUpdate={mockOnUpdate} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    const inProgressOption = screen.getByText('IN PROGRESS');
    fireEvent.click(inProgressOption);

    await waitFor(() => {
      expect(mockBugApi.update).toHaveBeenCalledWith('1', { status: 'in-progress' });
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedBug);
    });
  });

  it('deletes bug when delete option is clicked', async () => {
    const mockOnDelete = jest.fn();
    mockBugApi.delete.mockResolvedValue(undefined);
    
    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Delete Bug');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockBugApi.delete).toHaveBeenCalledWith('1');
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    mockConfirm.mockRestore();
  });

  it('does not show menu when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
    });

    render(<BugCard bug={mockBug} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});