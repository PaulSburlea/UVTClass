// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  courseFiles: f({ pdf: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete", file);
      console.log("Metadata", metadata);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
