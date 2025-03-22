# Project Bolt

A modern web application for job application tracking and automated email management.

## Features

- Google Authentication
- Email Integration
- Job Application Tracking
- Password Reset Functionality
- Modern UI with Tailwind CSS

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd project-bolt
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
- Copy `.env.example` to `.env`
- Fill in your environment variables:
  - `VITE_SUPABASE_URL`: Your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
  - `VITE_RESEND_API_KEY`: Your Resend API key

4. Start the development server
```bash
npm run dev
```

## Development

- Built with React + TypeScript
- Uses Vite for development and building
- Supabase for authentication and database
- Tailwind CSS for styling

## Security Notes

- Never commit `.env` files
- Keep API keys and secrets secure
- Use environment variables for sensitive data 