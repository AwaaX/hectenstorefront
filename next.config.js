const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();
 
/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname:"st1.thechristmasfabric.com"
      },
      {
        protocol: "https",
        hostname:"cdn.thechristmasfabric.com"
      },
      {
        protocol: "https",
        hostname:"www.st1.thechristmasfabric.com"
      },
      {
        protocol: "https",
        hostname: "tcfbucket.s3.fr-par.scw.cloud",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
  output: "standalone",
}

module.exports = withNextIntl(nextConfig);
