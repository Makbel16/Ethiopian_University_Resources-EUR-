# University Student Resource Hub (Ethiopia)

Full-stack web app for Ethiopian university students to discover, download, and manage academic resources.

## Tech Stack
- Frontend: React + Material UI + React Router
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT with role-based access control

## Implemented Features
- Student registration/login with JWT
- Admin role with resource/blog management
- Resource upload (file or external URL), edit/delete, browsing/filtering/search, pagination
- Download counter and per-user download history (deduplicated by user-resource pair)
- Dashboard with recent, popular, weekly popular, and personalized recommendations
- User profile with bookmarks + download history
- Study Tips Blog CRUD (admin writes, students read)
- Contact form storage
- Responsive UI for mobile/tablet/desktop via Material UI grid system

## Project Structure
- `server`: Express API + MongoDB models
- `client`: React app

## Setup
1. Copy `server/.env.example` to `server/.env` and update values.
2. Install dependencies:
   - `npm run install:all`
3. Start backend:
   - `npm run dev:server`
4. Start frontend:
   - `npm run dev:client`

## Default Admin
- Email: from `ADMIN_EMAIL` in env (default `admin@urh.et`)
- Password: from `ADMIN_PASSWORD` in env (default `Admin@12345`)
- Auto-seeded on backend startup if it does not exist.

## Notes
- Uploaded files are stored in `server/uploads`.
- Optional email notifications for contact form can be added using Nodemailer.
- Extendable ideas already supported by schema/API shape:
  - resource ratings
  - comment threads
  - quiz/exam prep collections
