# UVTClass  

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)  
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)  
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)  
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)](https://www.prisma.io/)  
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)  
[![Clerk](https://img.shields.io/badge/Auth-Clerk-4a90e2?logo=clerk)](https://clerk.com/)  

---

A modern web application designed to manage courses, classrooms, and student–teacher interactions at **West University of Timișoara**.  
Built with **Next.js 14, TypeScript, Tailwind CSS, Prisma, and Clerk**, UVTClass provides a smooth user experience with a scalable architecture for academic environments.  

---

## 🚀 Features  

- 👨‍🏫 **Teacher dashboard** – create, edit, and manage courses  
- 🎓 **Student dashboard** – enroll and access course materials  
- 📂 **Classroom management** – structured views for enrolled and available courses  
- 🔑 **Authentication & authorization** with Clerk  
- 📊 **Responsive UI** with Tailwind CSS  
- ⚡ **Optimized database access** using Prisma & PostgreSQL  
- 🌐 **Next.js App Router** with server + client components  

---

## 🛠️ Tech Stack  

- **Frontend:** [Next.js 14](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)  
- **Backend:** Next.js API Routes, [Prisma ORM](https://www.prisma.io/)  
- **Database:** PostgreSQL  
- **Auth:** [Clerk](https://clerk.com)  
- **Other:** TypeScript, Lucide Icons, Shadcn UI  

---

## 📦 Installation & Setup  

Clone the repository:  
```bash
git clone https://github.com/PaulSburlea/UVTClass.git
cd UVTClass
```

Install dependencies:
```bash
npm install
```

Set up environment variables in a .env file:
```bash
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/uvtclass
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm run start
```

📖 Project Structure
```bash
app/
 ├─ (dashboard)/         # Teacher & Student dashboards
 │   ├─ _components/     # Reusable UI components
 │   └─ page.tsx
 ├─ api/                 # API routes
 ├─ components/          # Shared components
 └─ lib/                 # Utils & database helpers
 ```

📅 Roadmap
 Implement notifications system

 Add file upload for course materials

 Improve analytics for teachers

 Enhance responsive design for mobile

## 🤝 Contributing
Contributions are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request
