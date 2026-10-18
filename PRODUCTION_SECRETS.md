# Production Secrets — HOWTO

This file lists the repository secrets required for production deployment and provides quick instructions to set them in GitHub Actions or via the GitHub CLI (gh).

Required secret names (exact):

- GHCR_TOKEN  # Personal Access Token with scopes: repo, write:packages, read:packages
- DATABASE_URL  # PostgreSQL connection string, e.g. postgresql://user:pass@host:5432/dbname
- REDIS_URL  # Redis URL, e.g. redis://:password@host:6379 or redis://host:6379
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL  # https://<backend-url>/api/v1/auth/google/callback
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET_NAME
- FRONTEND_WEB_URL  # e.g. https://your-frontend.netlify.app

Quick web UI method
1. Go to: Settings → Secrets and variables → Actions in this repository.
2. Click "New repository secret" and add each name above with its value.

Quick gh CLI method
1. Install and authenticate gh: https://cli.github.com/manual/installation
2. Login: gh auth login
3. From a local clone of this repo or any machine with gh installed, run:

   echo -n "VALUE" | gh secret set GHCR_TOKEN -R avajit/akmart-ecommerce --body "$(echo -n 'VALUE')"

Or use the helper script in .github/scripts/set_github_secrets.sh (recommended):

- Create a file named `prod.env` (copy from `prod.env.example`) and fill values.
- Run: `gh auth login` to authenticate the CLI.
- Run: `bash .github/scripts/set_github_secrets.sh`

Security notes
- Do NOT check real secret values into the repo.
- Use a strong random value for JWT secrets. Example generator: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- GHCR_TOKEN must have `repo` and `write:packages` scopes.

