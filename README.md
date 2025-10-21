# GatePass Authentication Backend

Node.js + Express authentication and authorization backend for GatePass.

## Tech Stack
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- express-rate-limit
- morgan
- cors

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `config/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gatepass
   JWT_SECRET=change_me
   CORS_ORIGINS=*
   ```
3. Start the server:
   ```bash
   npm start
   ```

## API
- Health: `GET /health`
- Docs: `GET /api/docs`
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Me: `GET /api/auth/me` (Bearer token required)

## Notes
- Passwords are hashed with bcryptjs.
- JWT expiry is 1 day.
- Login is rate-limited to 5 attempts / 15 minutes per IP.
- Use specific CORS origins in production.
# gatepass
