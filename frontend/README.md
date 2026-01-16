# Frontend - Next.js React Application

## Overview
This is the frontend for the Expense Reimbursement System built with Next.js and React.

## Project Structure

```
frontend/
├── page.tsx               # Root page / Dashboard
├── home/
│   └── page.tsx          # Home page
├── login/
│   └── page.tsx          # Login page
├── register/
│   └── page.tsx          # Registration page
├── verify-otp/
│   └── page.tsx          # OTP verification page
└── README.md             # This file
```

## Technology Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Fetch API / Axios
- **Authentication**: JWT Tokens

## Features

### Authentication Pages
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Verify OTP** (`/verify-otp`) - Email verification

### Main Pages
- **Dashboard** (`/`) - Main application interface
- **Home** (`/home`) - Home page content

## Page Components

### Login Page (`login/page.tsx`)
- Email and password input
- Form validation
- Error handling
- Redirect to dashboard on success

### Register Page (`register/page.tsx`)
- User registration form
- Field validation
- OTP email verification
- Terms acceptance

### OTP Verification (`verify-otp/page.tsx`)
- OTP code input
- Email verification
- Account activation
- Redirect to login

### Dashboard (`page.tsx`)
- Expense list view
- Create expense form
- Approval workflow interface
- User profile section

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend
npm install
# or
yarn install
```

### Running Locally

```bash
npm run dev
# or
yarn dev
```

Open http://localhost:3000 in your browser.

### Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Environment Configuration

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Expense Reimbursement System
```

## API Integration

All API calls go to the backend at `http://localhost:8000`:

### Authentication Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification  
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Token refresh

### Expense Endpoints Used
- `POST /api/expenses/submit` - Create expense
- `GET /api/expenses/` - List expenses
- `GET /api/expenses/{id}` - Get expense details
- `POST /api/expenses/{id}/upload-bill` - Upload files

### Approval Endpoints Used
- `GET /api/approvals/pending-manager` - Pending approvals
- `POST /api/approvals/manager/{id}/approve` - Approve
- `POST /api/approvals/manager/{id}/reject` - Reject

## Component Patterns

### Form Handling
```tsx
const [formData, setFormData] = useState({...});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // API call
};
```

### Authentication Flow
```tsx
// On login, save token
localStorage.setItem('token', response.access_token);

// Use in API calls
headers = { Authorization: `Bearer ${token}` };

// Redirect on success
router.push('/home');
```

### API Error Handling
```tsx
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    setError(data.detail || 'Error');
  }
} catch (err) {
  setError(err.message);
}
```

## Styling

Uses Tailwind CSS utility classes. Examples:

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <button className="bg-blue-600 hover:bg-blue-700 text-white">
    Submit
  </button>
</div>
```

## State Management

Currently uses React hooks for state:
- `useState` - Component state
- `useRouter` - Navigation
- `useEffect` - Side effects

For larger apps, consider:
- Redux
- Zustand
- Context API

## File Upload

Upload files to expenses:

```tsx
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `/api/expenses/${expenseId}/upload-bill`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    }
  );
};
```

## Type Definitions

For TypeScript support, create types:

```tsx
// types/index.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  role: string;
}

export interface Expense {
  id: number;
  amount: number;
  category_id: number;
  status: string;
  created_at: string;
}

export interface Approval {
  id: number;
  expense_id: number;
  decision: string;
  comments?: string;
}
```

## Debugging

### Browser DevTools
- Open DevTools (F12)
- Network tab for API calls
- Application tab for localStorage
- Console for errors

### Next.js Debug Mode
```bash
NODE_DEBUG=next:* npm run dev
```

## Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo"
  width={200}
  height={200}
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic';
const Component = dynamic(() => import('./Component'));
```

### Caching
```tsx
const response = await fetch(url, {
  cache: 'force-cache'
});
```

## Testing

Add testing dependencies:
```bash
npm install --save-dev @testing-library/react jest
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
Update the main `docker-compose.yml` to include frontend service.

## Troubleshooting

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
```

**API connection errors:**
- Check NEXT_PUBLIC_API_URL
- Verify backend is running
- Check CORS settings in backend

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

**Last Updated**: January 2026
