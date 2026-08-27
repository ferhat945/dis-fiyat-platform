import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.disfiyat360.com",
          },
        ],
        destination: "https://disfiyat360.com/:path*",
        permanent: true,
      },

      {
        source: "/hizmetler/:service",
        destination: "/hizmet/:service",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;