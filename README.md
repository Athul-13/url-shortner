# URL Shortener Platform

A namespaced URL shortening platform with organizational privileges and secure access control.

## Features

- **User Authentication**: JWT-based authentication with signup and login
- **Organizations**: Users can create and manage multiple organizations
- **Role-Based Access Control**: Admin, Editor, and Viewer roles
- **Namespaces**: Globally unique namespaces for organizing short URLs
- **Short URL Management**: Create, update, and delete short URLs with customizable codes
- **Auto-generated Short Codes**: Random short codes if not specified by user

## Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT Authentication (djangorestframework-simplejwt)

### Frontend
- React 19
- TypeScript
- Material-UI
- React Router
- Axios

## Project Structure

```
url-short/
├── backend/
│   ├── apps/
│   │   ├── users/          # User authentication
│   │   ├── organizations/  # Organization management
│   │   ├── namespaces/     # Namespace management
│   │   └── urls/          # Short URL management
│   ├── core/
│   │   ├── constants.py    # API endpoint constants
│   │   └── permissions.py  # Custom permissions
│   └── url_short/
│       └── settings.py     # Django settings
├── frontend/
│   └── src/
│       ├── api/            # API client and services
│       ├── components/     # Reusable components
│       ├── contexts/       # React contexts (Auth)
│       ├── pages/          # Page components
│       ├── constants/      # Frontend constants
│       └── utils/          # Utility functions
└── docker-compose.yml
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example` and configure your settings:
```bash
# Copy example file
cp .env.example .env

# Edit .env with your configuration
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
# Copy example file
cp .env.example .env

# Edit .env with your configuration
# Default: VITE_API_BASE_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Docker Setup (Optional)

If you prefer using Docker:

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Usage Flow

### For New Users (Signup)

1. **Sign Up**: User creates an account and provides an organization name
2. **Auto-login**: User is automatically logged in after signup
3. **Create Organization** (optional): User can create additional organizations
4. **Dashboard**: User is redirected to the dashboard

### For Existing Users (Login)

1. **Login**: User signs in with credentials
2. **Dashboard**: User is directly redirected to the dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user and create organization
- `POST /api/auth/login/` - Login user
- `GET /api/auth/me/` - Get current user info

### Organizations
- `GET /api/organizations/` - List user's organizations
- `POST /api/organizations/` - Create new organization
- `GET /api/organizations/{id}/` - Get organization details

### Namespaces
- `GET /api/namespaces/` - List namespaces
- `POST /api/namespaces/` - Create namespace (Admin only)
- `GET /api/namespaces/{id}/` - Get namespace details

### Short URLs
- `GET /api/urls/` - List short URLs
- `POST /api/urls/` - Create short URL
- `GET /api/urls/{id}/` - Get short URL details
- `PUT /api/urls/{id}/` - Update short URL (Admin/Editor)
- `DELETE /api/urls/{id}/` - Delete short URL (Admin/Editor)

## Role Permissions

- **Admin**: Full access - can create namespaces, invite users, create/edit/delete URLs
- **Editor**: Can create/edit/delete URLs, view short URLs
- **Viewer**: Can only view short URLs

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=url_shortener
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET_KEY=your-jwt-secret
SHORT_CODE_LENGTH=8
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=URL Shortener
```

## Development Notes

- All API endpoint URLs are defined in constants files - no hardcoded URLs
- All configurable values come from environment variables
- JWT tokens are stored in localStorage
- Proper separation of concerns with dedicated apps for each feature
- Material-UI theming for consistent UI design

## Next Steps

- Implement namespace creation in the UI
- Add short URL creation interface
- Implement bulk URL shortening via Excel upload
- Add analytics and click tracking
- Implement user invitation system
- Add URL redirection endpoint

## License

This project is private and proprietary.
