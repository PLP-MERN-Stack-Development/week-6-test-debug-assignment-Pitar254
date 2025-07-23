export interface Bug {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  reporter_id: string;
  assignee_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
  };
}

export interface BugFormData {
  title: string;
  description: string;
  priority: Bug['priority'];
  assignee?: string;
  tags?: string[];
}

export interface BugStats {
  total: number;
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
}