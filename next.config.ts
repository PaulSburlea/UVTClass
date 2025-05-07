import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "utfs.io",
    ]
  },

  // → aici adaugi redirect-ul de la "/" la "/student"
  async redirects() {
    return [
      {
        source: "/",         // orice cerere către root
        destination: "/student", // va fi redirecționată
        permanent: true      // 308 Permanent Redirect
      },
    ];
  },
};

export default nextConfig;
