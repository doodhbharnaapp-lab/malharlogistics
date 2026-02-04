/** @type {import('next').NextConfig} */
const nextConfig = {
    // If BASEPATH is undefined or empty, use empty string
    basePath: process.env.BASEPATH || '',
    // Optional: Add trailing slash if needed
    trailingSlash: false,
    // Add rewrites to proxy the external SMS API through your Next.js server
    async rewrites() {
        return [
            {
                source: '/api/sms-proxy/:path*',
                destination: 'http://13.200.203.109/V2/:path*',
            },
        ];
    },
    async redirects() {
        const basePath = process.env.BASEPATH || '';
        return [
            {
                source: `${basePath}/`,
                destination: `${basePath}/front-pages/landing-page`,
                permanent: true,
                locale: false
            },
            {
                source: `${basePath}/:lang(en|fr|ar)`,
                destination: `${basePath}/front-pages/landing-page`,
                permanent: true,
                locale: false
            },
            {
                source: `${basePath}/:path((?!en|fr|ar|front-pages|images|api|favicon.png).*)*`,
                destination: `${basePath}/en/:path*`,
                permanent: true,
                locale: false
            }
        ];
    },
    // Important for Vercel
    output: 'standalone',
};
export default nextConfig;
