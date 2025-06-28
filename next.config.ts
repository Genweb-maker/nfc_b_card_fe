import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow cross-origin requests from local network IPs during development
  allowedDevOrigins: [
    'localhost:3001',
    '127.0.0.1:3001',
    '192.168.1.4:3001', // Your specific IP
    // Add your local network IP range
    '192.168.1.0/24', // This covers 192.168.1.1 to 192.168.1.254
    '192.168.0.0/24', // Common alternative range
    '10.0.0.0/8',     // Common home network range
    '172.16.0.0/12',  // Another common range
  ],
};

export default nextConfig;
