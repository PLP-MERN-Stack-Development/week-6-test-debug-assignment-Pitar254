# MERN Bug Tracker - Testing & Debugging Project

A comprehensive bug tracking application built with the MERN stack, featuring extensive testing and debugging capabilities. This project demonstrates best practices for testing, error handling, and debugging in modern web applications.

## 🚀 Features

### Core Functionality
- **Bug Management**: Create, read, update, and delete bug reports
- **User Authentication**: Secure registration and login system
- **Status Tracking**: Track bugs through different states (open, in-progress, resolved, closed)
- **Priority System**: Categorize bugs by priority levels (low, medium, high, critical)
- **Search & Filter**: Advanced filtering by status, priority, and search terms
- **Statistics Dashboard**: Visual analytics and bug statistics
- **Responsive Design**: Mobile-first responsive interface

### Testing & Debugging Features
- **Comprehensive Test Suite**: Unit, integration, and component tests
- **Error Boundaries**: React error boundaries for graceful error handling
- **Debug Utilities**: Development debugging tools and logging
- **API Error Handling**: Robust error handling for API calls
- **Loading States**: User-friendly loading indicators
- **Form Validation**: Client and server-side validation

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Testing Library** for component testing
- **Vitest** for unit testing

### Backend
- **Node.js** with Express
- **Supabase** (PostgreSQL) for database
- **JWT** for authentication
- **Jest & Supertest** for API testing
- **Joi** for validation
- **Helmet** for security

### Testing Tools
- **Vitest** - Frontend unit testing
- **React Testing Library** - Component testing
- **Jest** - Backend unit testing
- **Supertest** - API integration testing
- **JSdom** - DOM simulation for testing

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Supabase account and project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mern-bug-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

### 4. Database Setup
The application uses Supabase for database management. You'll need to create the following tables:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
```

#### Bugs Table
```sql
CREATE TABLE bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')) DEFAULT 'open',
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bugs" ON bugs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create bugs" ON bugs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update bugs" ON bugs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete bugs" ON bugs FOR DELETE TO authenticated USING (true);
```

### 5. Run the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Run Frontend Only
```bash
npm run client:dev
```

#### Run Backend Only
```bash
npm run server:dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Frontend Tests Only
```bash
npm run test:ui
```

### Backend Tests Only
```bash
npm run test:server
```

### Test Coverage
```bash
npm run test:coverage
```

### Testing Strategy

#### Frontend Testing
- **Unit Tests**: Individual component logic and utilities
- **Integration Tests**: Component interactions and API calls
- **User Interaction Tests**: Form submissions, button clicks, navigation

#### Backend Testing
- **Unit Tests**: Individual functions and middleware
- **Integration Tests**: API endpoints and database operations
- **Validation Tests**: Input validation and error handling

### Example Test Cases

#### Component Testing
```typescript
// Test bug card rendering
it('renders bug information correctly', () => {
  render(<BugCard bug={mockBug} />);
  expect(screen.getByText('Test Bug')).toBeInTheDocument();
});

// Test form submission
it('submits form with valid data', async () => {
  const mockOnSuccess = jest.fn();
  render(<BugForm onSuccess={mockOnSuccess} />);
  
  await user.type(screen.getByLabelText(/bug title/i), 'Test Bug');
  fireEvent.click(screen.getByText(/create bug report/i));
  
  expect(mockOnSuccess).toHaveBeenCalled();
});
```

#### API Testing
```javascript
// Test bug creation endpoint
describe('POST /api/bugs', () => {
  it('should create a new bug', async () => {
    const response = await request(app)
      .post('/api/bugs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bugData)
      .expect(201);
      
    expect(response.body.title).toBe(bugData.title);
  });
});
```

## 🐛 Debugging Techniques

### Development Debugging Tools

#### Debug Utilities
```typescript
import { debugLog, debugError, debugWarn } from './utils/debug';

// Log debug information
debugLog('User logged in:', user);

// Log errors with context
debugError('API call failed', error);

// Performance measurement
measurePerformance('Component render', () => {
  // Component logic
});
```

#### Browser DevTools
- **Network Tab**: Monitor API requests and responses
- **React DevTools**: Inspect component state and props
- **Console**: View debug logs and error messages
- **Sources**: Set breakpoints and step through code

#### Server-Side Debugging
```bash
# Enable debug mode
NODE_ENV=development npm run server:dev

# Use Node.js inspector
node --inspect server/index.js
```

### Error Handling

#### Frontend Error Boundaries
```typescript
<ErrorBoundary fallback={<CustomErrorComponent />}>
  <App />
</ErrorBoundary>
```

#### API Error Handling
```typescript
try {
  const response = await bugApi.create(bugData);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle specific API errors
    console.error('API Error:', error.message);
  }
}
```

#### Server Error Middleware
```javascript
app.use((err, req, res, next) => {
  logger.error(`Error ${statusCode}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
  });
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});
```

### Common Debugging Scenarios

#### Authentication Issues
1. Check JWT token in localStorage
2. Verify API Authorization headers
3. Inspect network requests for 401 errors
4. Check server logs for authentication failures

#### API Integration Problems
1. Use browser Network tab to inspect requests
2. Check request/response format
3. Verify CORS configuration
4. Test API endpoints with tools like Postman

#### Database Connection Issues
1. Verify Supabase credentials
2. Check database connection logs
3. Test SQL queries in Supabase dashboard
4. Validate RLS policies

## 📁 Project Structure

```
mern-bug-tracker/
├── server/                 # Backend Express application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── __tests__/         # Backend tests
├── src/                   # Frontend React application
│   ├── components/        # React components
│   │   ├── auth/          # Authentication components  
│   │   ├── bugs/          # Bug-related components
│   │   ├── common/        # Shared components
│   │   └── __tests__/     # Component tests
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Frontend utilities
│   └── test/              # Test configuration
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── jest.config.js         # Jest configuration
└── README.md              # This file
```

## 🔧 Configuration Files

### Vite Configuration (`vite.config.ts`)
- React plugin setup
- Test environment configuration
- Proxy setup for API calls
- JSdom environment for testing

### Jest Configuration (`jest.config.js`)
- Node environment for backend tests
- ESM module support
- Coverage collection setup

### Tailwind Configuration (`tailwind.config.js`)
- Content paths for purging
- Custom theme extensions
- Responsive breakpoints

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Learning Outcomes

By working with this project, you'll gain experience with:

- **Testing Strategies**: Unit, integration, and component testing
- **Error Handling**: Graceful error handling and user feedback
- **Debugging Techniques**: Browser DevTools and server-side debugging
- **API Design**: RESTful API design and testing
- **Authentication**: JWT-based authentication implementation
- **Database Operations**: CRUD operations with proper error handling
- **Modern React**: Hooks, context, and TypeScript
- **Development Workflow**: Testing, debugging, and deployment processes

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Express.js Testing](https://expressjs.com/en/guide/testing.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Chrome DevTools Guide](https://developers.google.com/web/tools/chrome-devtools)

---

**Note**: This project is designed for educational purposes to demonstrate testing and debugging best practices in MERN applications. The intentional bugs and debugging scenarios help reinforce learning objectives.