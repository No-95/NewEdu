/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/offer/course-399k',
        destination: '/courses/cam-nang-video-tieng-han-san-xuat',
        permanent: true,
      },
      {
        source: '/offer/combo',
        destination: '/books',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
