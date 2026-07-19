# SCREEN Research Portal

Research workflow management operating system designed for the Sustainable Coexistence Research & Education Network (SCREEN).

## Features

- **Double Study Workspace**: Individual portals for Study 1 (Generative AI Application) and Study 2 (Gamification serious game).
- **Supervisor Portal**: Direct review workspace for supervisor overview, comments, and project progress monitoring.
- **Secure Access**: Lock screen gate protecting sensitive research records and databases.
- **Supabase Integration**: Real-time cross-device synchronization and persistence layer.

## Setup & Deployment

### Environment Configuration
Configure local development credentials in a `.env` file at the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### GitHub Secrets for Deployment
To enable GitHub Pages deployment with database synchronization, add these repository secrets in your GitHub settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
