import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BugForm } from '../bugs/BugForm';
import { bugApi } from '../../utils/api';

jest.mock('../../utils/api');

const mockBugApi = bugApi as jest.Mocked<typeof bugApi>;

describe('BugForm', () => {
  beforeEach(() => {
    mockBugApi.create.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<BugForm />);

    expect(screen.getByLabelText(/bug title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByText(/create bug report/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<BugForm />);

    const submitButton = screen.getByText(/create bug report/i);
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    const titleInput = screen.getByLabelText(/bug title/i);
    expect(titleInput).toBeInvalid();
  });

  it('submits form with valid data', async () => {
    const mockOnSuccess = jest.fn();
    const user = userEvent.setup();
    
    mockBugApi.create.mockResolvedValue({
      id: '1',
      title: 'Test Bug',
      description: 'Test Description',
      priority: 'high',
      status: 'open',
      reporter_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    });

    render(<BugForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');

    fireEvent.click(screen.getByText(/create bug report/i));

    await waitFor(() => {
      expect(mockBugApi.create).toHaveBeenCalledWith({
        title: 'Test Bug',
        description: 'Test Description',
        priority: 'high',
        tags: [],
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles tag addition and removal', async () => {
    const user = userEvent.setup();
    render(<BugForm />);

    const tagInput = screen.getByPlaceholderText(/add tags/i);
    await user.type(tagInput, 'frontend');
    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByText('frontend')).toBeInTheDocument();

    // Remove tag
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    expect(screen.queryByText('frontend')).not.toBeInTheDocument();
  });

  it('adds tag on Enter key press', async () => {
    const user = userEvent.setup();
    render(<BugForm />);

    const tagInput = screen.getByPlaceholderText(/add tags/i);
    await user.type(tagInput, 'backend{enter}');

    expect(screen.getByText('backend')).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    mockBugApi.create.mockRejectedValue(new Error('API Error'));

    render(<BugForm />);

    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');

    fireEvent.click(screen.getByText(/create bug report/i));

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
</biltAction>