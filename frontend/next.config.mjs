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
        source: '/missions',
        destination: '/#missions',
        permanent: true,
      },
      {
        source: '/timeline-planner',
        destination: '/#timeline-planner',
        permanent: true,
      },
      {
        source: '/anomaly-center',
        destination: '/#anomaly-center',
        permanent: true,
      },
      {
        source: '/command-center',
        destination: '/#command-center',
        permanent: true,
      },
      {
        source: '/procedures',
        destination: '/#procedures',
        permanent: true,
      },
      {
        source: '/event-timeline',
        destination: '/#event-timeline',
        permanent: true,
      },
      {
        source: '/simulation',
        destination: '/',
        permanent: true,
      },
      {
        source: '/reports',
        destination: '/#reports',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
