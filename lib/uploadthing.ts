import { generateUploadButton, generateUploader } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// pentru <UploadButton />
export const UploadButton = generateUploadButton<OurFileRouter>();

// pentru uploadFiles(...)
export const uploadFiles = generateUploader<OurFileRouter>();
