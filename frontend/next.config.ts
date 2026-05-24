import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
};

export default config;
