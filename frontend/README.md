# URL Shortener - Frontend

React + TypeScript + Material-UI frontend for the URL Shortener platform.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

## Project Structure

```
src/
├── api/
│   ├── client.ts              # Axios client with JWT interceptors
│   └── services/              # API service modules
│       ├── auth.ts           # Authentication API calls
│       ├── organizations.ts  # Organization API calls
│       └── urls.ts          # Short URL API calls
├── components/
│   └── common/
│       └── ProtectedRoute.tsx # Route protection HOC
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── pages/
│   ├── Signup.tsx           # User registration
│   ├── Login.tsx            # User login
│   ├── CreateOrganization.tsx # Organization creation
│   └── Dashboard.tsx        # Main dashboard
├── constants/
│   └── api.ts              # API endpoint constants
├── utils/
│   └── auth.ts             # Authentication utilities
├── App.tsx                  # Main app with routing
└── main.tsx                 # Application entry point
```

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=URL Shortener
```

### Development

```bash
npm run dev
```

The app will run at http://localhost:5173

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Features

### Authentication
- User registration with organization creation
- User login with JWT tokens
- Automatic token refresh
- Protected routes
- Persistent authentication (localStorage)

### User Interface
- Material-UI themed components
- Responsive design
- Form validation
- Loading states
- Error handling
- Toast notifications (via MUI)

### Routing
- `/signup` - User registration
- `/login` - User login
- `/create-organization` - Create organization (protected)
- `/dashboard` - Main dashboard (protected)
- `/` - Redirects to dashboard

## API Integration

All API calls go through the centralized Axios client with:
- Automatic JWT token injection
- Token refresh on 401 errors
- Error interceptors
- Request/response logging (dev mode)

## State Management

- **AuthContext** - Global authentication state
- **React Hooks** - Local component state
- **localStorage** - Token persistence

## Development Notes

- All API URLs are defined in `constants/api.ts`
- No hardcoded values - use environment variables
- TypeScript strict mode enabled
- ESLint configured for React + TypeScript
- Material-UI theming in `App.tsx`

## Troubleshooting

### CORS Errors
- Ensure backend CORS settings include `http://localhost:5173`
- Check backend is running on correct port

### API Connection Failed
- Verify `VITE_API_BASE_URL` in `.env`
- Ensure backend server is running
- Check network tab for detailed errors

### Token Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT configuration in backend
- Verify token format in Network tab

## Next Features

- Namespace management UI
- Short URL creation interface
- URL list with search/filter
- Analytics dashboard
- User management
- Bulk upload interface

## License

Private and proprietary.
