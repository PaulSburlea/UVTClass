// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "utfs.io",
      "img.clerk.com",
      "uploadthing.com",
      "www.google.com",
    ],

     remotePatterns: [
            {
        protocol: "https",
        hostname: "*.ufs.sh",
        port: "",
        pathname: "/**",
      },
       {
         protocol: "https",
         hostname: "img.youtube.com",
         port: "",
         pathname: "/vi/**",
       },
       {
         protocol: "https",
         hostname: "*.google.com",
         port: "",
         pathname: "/s2/favicons/**",
       },
     ],
  },
};

export default nextConfig;
