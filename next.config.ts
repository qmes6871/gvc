import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/gvc_partners_web",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kxuylbiohxjatsqdyssz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
