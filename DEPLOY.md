# Deploy notes for Backend

## Required environment variables
- DATABASE_URL: postgres://user:pass@host:5432/db
- JWT_SECRET: your_jwt_secret
- NODE_ENV: production
- PORT: 5000
- AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (if using S3)
- EMAIL_HOST, EMAIL_USER, EMAIL_PASS (if using nodemailer)
- PAYMENT gateway keys (eSewa / Khalti)

## Local testing
1. Build and run with docker-compose:
   docker compose up --build

2. Check health endpoint:
   curl http://localhost:5000/health

## CI flow
- On push to main, GitHub Actions will build & push an image to GHCR and run prisma migrate deploy.
- Add these secrets in the repository settings before pushing to main:
  - GHCR_TOKEN
  - DATABASE_URL
  - JWT_SECRET
  - Any other secrets (S3, email, payments)

## Netlify frontend integration
- In Netlify site settings add environment variables:
  - VITE_API_URL = https://your-backend.example.com
  - VITE_GOOGLE_CLIENT_ID = <prod google client id>
- Trigger a Netlify deploy so Vite rebuilds with the live backend URL.
