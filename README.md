This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
frontend
├─ app
│  ├─ (auth)
│  │  ├─ (routes)
│  │  │  ├─ sign-in
│  │  │  │  └─ [[...sign-in]]
│  │  │  │     └─ page.tsx
│  │  │  └─ sign-up
│  │  │     └─ [[...sign-up]]
│  │  │        └─ page.tsx
│  │  └─ layout.tsx
│  ├─ (dashboard)
│  │  ├─ (routes)
│  │  │  ├─ admin
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ _components
│  │  │  │     ├─ assign-teacher-form.tsx
│  │  │  │     └─ teacher-list.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ student
│  │  │  │  ├─ courses
│  │  │  │  │  └─ [courseId]
│  │  │  │  │     ├─ details
│  │  │  │  │     │  └─ [postId]
│  │  │  │  │     │     └─ page.tsx
│  │  │  │  │     ├─ page.tsx
│  │  │  │  │     ├─ people
│  │  │  │  │     │  └─ page.tsx
│  │  │  │  │     └─ _components
│  │  │  │  │        └─ post-list-wrapper.tsx
│  │  │  │  ├─ grades
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  └─ [courseId]
│  │  │  │  │     └─ page.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ teacher
│  │  │     ├─ courses
│  │  │     │  └─ [courseId]
│  │  │     │     ├─ details
│  │  │     │     │  └─ [postId]
│  │  │     │     │     ├─ page.tsx
│  │  │     │     │     └─ _components
│  │  │     │     │        ├─ comment-box.tsx
│  │  │     │     │        ├─ comment-list.tsx
│  │  │     │     │        ├─ comment-section.tsx
│  │  │     │     │        └─ post-action.tsx
│  │  │     │     ├─ edit
│  │  │     │     │  └─ page.tsx
│  │  │     │     ├─ page.tsx
│  │  │     │     ├─ people
│  │  │     │     │  ├─ page.tsx
│  │  │     │     │  └─ _components
│  │  │     │     │     └─ people.tsx
│  │  │     │     └─ _components
│  │  │     │        ├─ client-course-page.tsx
│  │  │     │        ├─ course-card.tsx
│  │  │     │        ├─ course-finalize.tsx
│  │  │     │        ├─ course-info.tsx
│  │  │     │        ├─ room-form.tsx
│  │  │     │        ├─ section-form.tsx
│  │  │     │        ├─ subject-form.tsx
│  │  │     │        ├─ teacher-dashboard.tsx
│  │  │     │        └─ title-form.tsx
│  │  │     ├─ create
│  │  │     │  └─ page.tsx
│  │  │     ├─ grades
│  │  │     │  ├─ page.tsx
│  │  │     │  └─ [courseId]
│  │  │     │     ├─ page.tsx
│  │  │     │     ├─ [studentId]
│  │  │     │     │  └─ page.tsx
│  │  │     │     └─ _components
│  │  │     │        └─ students-search-list.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ posts
│  │  │        └─ _components
│  │  │           ├─ edit-post-modal.tsx
│  │  │           ├─ post-form.tsx
│  │  │           ├─ post-list.tsx
│  │  │           └─ post-materials.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ _components
│  │     ├─ course-sub-navbar.tsx
│  │     ├─ logo.tsx
│  │     ├─ mobile-sidebar.tsx
│  │     ├─ navbar.tsx
│  │     ├─ sidebar-contex.tsx
│  │     ├─ sidebar-item.tsx
│  │     ├─ sidebar-routes.tsx
│  │     └─ sidebar.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ assign-teacher
│  │  │  │  └─ route.ts
│  │  │  ├─ remove-teacher
│  │  │  │  └─ route.ts
│  │  │  └─ teachers
│  │  │     └─ route.ts
│  │  ├─ classrooms
│  │  │  └─ [id]
│  │  │     ├─ role
│  │  │     │  └─ route.ts
│  │  │     └─ route.ts
│  │  ├─ comments
│  │  │  ├─ route.ts
│  │  │  └─ [commentId]
│  │  │     └─ route.ts
│  │  ├─ courses
│  │  │  ├─ route.ts
│  │  │  └─ [courseId]
│  │  │     ├─ remove-student
│  │  │     │  └─ route.ts
│  │  │     └─ route.ts
│  │  ├─ enroll-course
│  │  │  └─ route.tsx
│  │  ├─ enrolled-courses
│  │  │  └─ route.ts
│  │  ├─ get-title
│  │  │  └─ route.ts
│  │  ├─ grades
│  │  │  └─ route.ts
│  │  ├─ post
│  │  │  ├─ create
│  │  │  │  └─ route.ts
│  │  │  ├─ link
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  ├─ upload
│  │  │  │  └─ route.tsx
│  │  │  └─ [postId]
│  │  │     └─ route.ts
│  │  ├─ student
│  │  │  └─ courses
│  │  │     └─ route.ts
│  │  ├─ uploadthing
│  │  │  ├─ core.ts
│  │  │  └─ route.ts
│  │  ├─ users
│  │  │  └─ [id]
│  │  │     └─ route.ts
│  │  └─ youtube-title
│  │     └─ route.ts
│  ├─ enroll-course
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ types
│     ├─ classroom.ts
│     ├─ grade.ts
│     ├─ material.ts
│     ├─ posts.ts
│     └─ userClassroom.ts
├─ components
│  ├─ confirm-modal.tsx
│  ├─ file-upload.tsx
│  ├─ icon-badge.tsx
│  ├─ navbar-routes.tsx
│  ├─ providers
│  │  └─ toaster-provider.tsx
│  └─ ui
│     ├─ avatar.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ dialog.tsx
│     ├─ dropdown-menu.tsx
│     ├─ form.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ sheet.tsx
│     └─ textarea.tsx
├─ components.json
├─ eslint.config.mjs
├─ lib
│  ├─ db.ts
│  ├─ fetchCommentsTrees.ts
│  ├─ get-enrolled-courses.ts
│  ├─ mailer.ts
│  ├─ uploadthing.ts
│  ├─ use-is-teacher.ts
│  └─ utils.ts
├─ middleware.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250401181625_remove_price_from_course
│  │  │  └─ migration.sql
│  │  ├─ 20250402151704_update_schema
│  │  │  └─ migration.sql
│  │  ├─ 20250429093735_added_code
│  │  │  └─ migration.sql
│  │  ├─ 20250429122706_userid
│  │  │  └─ migration.sql
│  │  ├─ 20250507101842_add_material_model
│  │  │  └─ migration.sql
│  │  ├─ 20250507102431_add_material_model
│  │  │  └─ migration.sql
│  │  ├─ 20250507120112_changed
│  │  │  └─ migration.sql
│  │  ├─ 20250507125756_changed
│  │  │  └─ migration.sql
│  │  ├─ 20250507135639_authorname
│  │  │  └─ migration.sql
│  │  ├─ 20250507141416_add_post_title
│  │  │  └─ migration.sql
│  │  ├─ 20250509131841_added_comment
│  │  │  └─ migration.sql
│  │  ├─ 20250509134753_added_authorimg
│  │  │  └─ migration.sql
│  │  ├─ 20250509151430_content_optional
│  │  │  └─ migration.sql
│  │  ├─ 20250509171751_add_edited_at_to_comment
│  │  │  └─ migration.sql
│  │  ├─ 20250509172433_add_edited_at_to_post
│  │  │  └─ migration.sql
│  │  ├─ 20250509215155_added_userrole
│  │  │  └─ migration.sql
│  │  ├─ 20250509220136_hello
│  │  │  └─ migration.sql
│  │  ├─ 20250513205024_add_admin_model
│  │  │  └─ migration.sql
│  │  ├─ 20250513205048_add_admin_model
│  │  │  └─ migration.sql
│  │  ├─ 20250513211643_add_teacher_model
│  │  │  └─ migration.sql
│  │  ├─ 20250513222725_flexible_grades
│  │  │  └─ migration.sql
│  │  ├─ 20250513231710_add_weight_to_grade
│  │  │  └─ migration.sql
│  │  ├─ 20250513233156_add_position_to_grade
│  │  │  └─ migration.sql
│  │  ├─ 20250521185335_add_cascade_relations
│  │  │  └─ migration.sql
│  │  ├─ 20250521190331_add_post_title_content
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ public
│  ├─ default-avatar.png
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ logo.svg
│  ├─ logo1.svg
│  ├─ next.svg
│  ├─ pdf.worker.mjs
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ tailwind.config.js
└─ tsconfig.json

```