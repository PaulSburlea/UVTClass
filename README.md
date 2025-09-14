# Platformă de management academic pentru facultăți

**Proiect UVTClass – Next.js cu TypeScript și Tailwind, backend MySQL**

## Descriere
UVTClass este o aplicație web pentru gestionarea cursurilor și utilizatorilor (admin, profesori, studenți), cu autentificare, panou de control, comentarii și upload de fișiere, folosind Next.js (App Router), Clerk, Prisma și MySQL.

## Pre-rechizite
- Node.js instalat (necesar pentru npm)
- npm
- MySQL (local sau remote)

## Variabile de mediu
Copiază `env.example` în `.env` și completează:
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_BASE_URL=
DATABASE_URL=
UPLOADTHING_TOKEN=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=


## Instalare și migrații
git clone <repo-url>
cd proiect
npm install
# Se configurează .env cu variabilele necesare

# npx prisma migrate dev --name init

## Rulare locală
npm run dev

Se accesează: http://localhost:3000
