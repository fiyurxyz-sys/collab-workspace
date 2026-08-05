/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect root to dashboard or login based on auth
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
