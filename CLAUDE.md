# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PraiseStar (赞赞星) is a team atmosphere cultivation tool built with React. It's a dual-role system supporting both regular users and administrators, with features for giving praise stars, redeeming gifts, rankings, and Feishu (Lark) bulletin integration.

## Essential Commands

### Development
```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server on port 8081
npm start                      # Alternative dev server on port 8080
```

### Build and Deploy
```bash
npm run build                  # Build production bundle
npm run deploy:check           # Build and verify ready for deployment
npm run deploy                 # Build and execute deployment script
```

### Backend API
The frontend connects to a backend API at `http://39.105.117.48:3000/api` (configurable in `src/services/config.js`).

## Architecture

### Technology Stack
- **Frontend**: React 18 with JSX
- **UI Library**: Ant Design 5 (Chinese locale)
- **Build Tool**: Webpack 5 (NOT Vite)
- **Router**: React Router 6 with HashRouter
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios with interceptors
- **Styling**: CSS + Ant Design + SCSS with CSS Modules

### Key Architectural Patterns

#### Authentication System
Authentication is centralized through `AuthContext` (`src/contexts/AuthContext.jsx`) which provides:
- Dual authentication: Regular users and Super Admins
- Token-based auth stored in localStorage
- Async token verification on app initialization (non-blocking)
- Three user types: Regular users, Admins (`isAdmin: true`), Super Admins (`isSuperAdmin: true`)

#### API Layer Architecture
The API layer follows a service-oriented pattern:
- **apiClient.js**: Base axios instance with request/response interceptors
- **config.js**: Centralized API configuration (BASE_URL, endpoints, error codes)
- **Service files**: Domain-specific services (authService, userService, starsService, giftsService, rankingsService, bulletsService)
- **index.js**: Unified service exports

All API calls should go through the service layer, NOT direct axios calls.

#### Route Protection
Three route guard components in `App.jsx`:
- `UserRoute`: Regular users and admins
- `AdminRoute`: Admins and super admins only
- `SuperAdminRoute`: Super admins only

#### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── Layout.jsx       # Main layout with responsive sidebar
│   ├── ResponsiveTable.jsx
│   ├── StarDisplay.jsx
│   ├── StatCard.jsx
│   └── ...
├── contexts/            # React Context providers
│   └── AuthContext.jsx  # Central authentication state
├── pages/              # Page components (nested routes)
│   ├── Login/
│   ├── User/           # Regular user pages
│   │   ├── Dashboard.jsx
│   │   ├── Give.jsx
│   │   ├── Redeem.jsx
│   │   ├── Ranking.jsx
│   │   └── Record.jsx
│   ├── Admin/          # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Stars.jsx
│   │   ├── Gifts.jsx
│   │   ├── BulletScreen.jsx
│   │   ├── ImportCenter.jsx
│   │   ├── ExportCenter.jsx
│   │   └── KeywordRankings.jsx
│   └── SuperAdmin/
│       └── Dashboard.jsx
├── services/           # API service layer
│   ├── config.js       # API configuration
│   ├── apiClient.js    # Axios instance
│   └── *Service.js     # Domain services
└── utils/              # Utility functions
```

### Responsive Design
Mobile-first responsive design with breakpoints:
- < 480px: Mobile portrait
- 480px - 768px: Mobile landscape / small tablet
- 768px - 1024px: Tablet
- > 1024px: Desktop

Key responsive components:
- `Layout.jsx`: Collapsible sidebar → drawer menu on mobile
- `ResponsiveTable.jsx`: Simplified table display on small screens

## Critical Implementation Details

### Webpack Configuration
The project uses Webpack 5, NOT Vite:
- Entry: `src/main.jsx`
- Output: `dist/bundle.[contenthash].js`
- Babel transpilation for JSX/ES6+
- CSS Modules for SCSS files (localIdentName format)
- Webpack Dev Server with proxy for `/api` routes
- Code splitting: Separate chunks for vendors and antd

### Authentication Flow
1. User logs in via `Login` page → calls `authService.login()`
2. Backend returns token + user object
3. Token stored in localStorage with key `'token'`
4. User object stored in localStorage with key `'user'`
5. All API requests include `Authorization: Bearer ${token}` header (via interceptor)
6. On 401 response, interceptor clears localStorage (doesn't auto-redirect)
7. AuthContext initializes auth state on mount (async, non-blocking)

### API Request Pattern
Always use service methods, NOT direct axios:
```javascript
// CORRECT
import { userService } from '@/services'
const users = await userService.getUsers()

// WRONG
import axios from 'axios'
const users = await axios.get('/api/users')
```

### Error Handling
- API errors are caught by axios interceptor
- Errors return standardized format: `{ success: false, message: string, errors: [], status: number }`
- Use Ant Design's `message` component for user feedback
- CORS errors are detected and provide specific error messages

### State Management
- Global auth state: `AuthContext`
- Local component state: `useState` hooks
- No Redux or other state libraries
- API data is fetched on component mount, not cached globally

## Common Development Tasks

### Adding a New Page
1. Create page component in `src/pages/[User|Admin]/`
2. Add route in `src/App.jsx` with appropriate guard
3. Add menu item in `src/components/Layout.jsx`
4. Import and use service methods from `src/services/`

### Adding a New API Endpoint
1. Add endpoint path to `API_ENDPOINTS` in `src/services/config.js`
2. Add service method in appropriate service file (e.g., `userService.js`)
3. Use `api.get/post/put/delete` from `apiClient.js`
4. Handle response in component with try/catch

### File Upload
Use `api.upload()` from apiClient:
```javascript
const formData = new FormData()
formData.append('file', file)
await api.upload('/upload/image', formData)
```

### Testing with Mock Users
Test accounts are defined in mock data:
- Admin: `13800138001` (袁倩倩)
- Regular user: `13800138006` (张三)
- Password handling is managed by backend

## Deployment

### Production Build
```bash
npm run build
# Outputs to dist/ directory
# Contains bundle.[hash].js and vendors/antd chunks
```

### Deployment Target
- Production server: `39.105.117.48`
- Web root: `/www/wwwroot/39.105.117.48/`
- Backup location: `/www/wwwroot/39.105.117.48/backup/`
- Uses Nginx for static file serving
- Deployment via `deploy.sh` script or GitHub Actions

### Environment Configuration
- API base URL is set in `src/services/config.js` (line 6)
- Switch between production and local by commenting/uncommenting BASE_URL
- Webpack dev server proxies `/api` requests to `localhost:3000`

## Important Conventions

### Import Aliases
Webpack alias `@` points to `src/` directory:
```javascript
import Layout from '@/components/Layout'
```

### Component Naming
- PascalCase for component files and exports
- Descriptive names indicating purpose (e.g., `ResponsiveTable`, `AuthLoading`)

### CSS Modules
SCSS files are processed with CSS Modules:
```javascript
import styles from './Component.scss'
<div className={styles.container} />
```

Regular CSS files are global.

### API Response Format
Expected backend response structure:
```javascript
{
  success: boolean,
  message: string,
  data: any,
  errors?: array
}
```

### User Object Structure
```javascript
{
  id: number,
  name: string,
  phone: string,
  department: string,
  isAdmin: boolean,
  isSuperAdmin?: boolean,
  // ... other fields
}
```

## Known Issues and Considerations

### StrictMode Double Requests
Recent commits mention fixing duplicate requests caused by React StrictMode (commit: 501902b, c3c1a23). Be aware that StrictMode in development causes double-mounting.

### CORS Configuration
The dev server proxies API requests. For production, ensure backend CORS headers allow the frontend domain.

### HashRouter Usage
The app uses `HashRouter` (not `BrowserRouter`), so URLs have `#` in them (e.g., `/#/user/dashboard`). This simplifies deployment without server-side routing configuration.

### Token Expiration
Token verification is async and non-blocking on app init. If token expires, users remain logged in until they make an API call that returns 401.

### File Structure Note
Many documentation files exist in the root (e.g., `LOGIN_UPGRADE.md`, `GIFTS_API_INTEGRATION.md`). These document feature development history and API integration steps. Refer to these for historical context on specific features.