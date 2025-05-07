// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();
const authFn = (req: Request) => ({ id: "fakeId" }); // pune autentificarea ta

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "1GB", maxFileCount: 3 } })
    .middleware(async ({ req }) => {
      const user = await authFn(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Uploaded by:", metadata.userId, file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
