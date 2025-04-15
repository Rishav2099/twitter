import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", 'res.cloudinary.com'], // Allow Google profile image domain
  },
};

export default nextConfig;
