import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "api.lojinha.dev",
          },
        ],
        destination: "https://lojinha.dev/api/:path*",
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "api.localhost",
          },
        ],
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default config;
