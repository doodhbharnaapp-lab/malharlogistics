// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //     basePath: process.env.BASEPATH,
// //     redirects: async () => {
// //         return [
// //             {
// //                 source: '/',
// //                 destination: '/en/dashboards/crm',
// //                 permanent: true,
// //                 locale: false
// //             },
// //             {
// //                 source: '/:lang(en|fr|ar)',
// //                 destination: '/:lang/dashboards/crm',
// //                 permanent: true,
// //                 locale: false
// //             },
// //             {
// //                 source: '/:path((?!en|fr|ar|front-pages|images|api|favicon.ico).*)*',
// //                 destination: '/en/:path*',
// //                 permanent: true,
// //                 locale: false
// //             }
// //         ];
// //     }
// // };
// // export default nextConfig;
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     // If BASEPATH is undefined or empty, use empty string
//     basePath: process.env.BASEPATH || '',
//     // If you're using i18n with app router, consider this approach instead
//     // i18n: {
//     //     locales: ['en', 'fr', 'ar'],
//     //     defaultLocale: 'en',
//     // },
//     // Optional: Add trailing slash if needed
//     trailingSlash: false,
//     async redirects() {
//         const basePath = process.env.BASEPATH || '';
//         return [
//             {
//                 source: `${basePath}/`,
//                 destination: `${basePath}/en/dashboards/crm`,
//                 permanent: true,
//                 locale: false
//             },
//             {
//                 source: `${basePath}/:lang(en|fr|ar)`,
//                 destination: `${basePath}/:lang/dashboards/crm`,
//                 permanent: true,
//                 locale: false
//             },
//             {
//                 source: `${basePath}/:path((?!en|fr|ar|front-pages|images|api|favicon.ico).*)*`,
//                 destination: `${basePath}/en/:path*`,
//                 permanent: true,
//                 locale: false
//             }
//         ];
//     },
//     // Important for Vercel
//     output: 'standalone', // or remove this if causing issues
// };
// export default nextConfig;
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     // If BASEPATH is undefined or empty, use empty string
//     basePath: process.env.BASEPATH || '',
//     // Optional: Add trailing slash if needed
//     trailingSlash: false,
//     // Add rewrites to proxy the external SMS API through your Next.js server
//     async rewrites() {
//         return [
//             {
//                 source: '/api/sms-proxy/:path*',
//                 destination: 'http://13.200.203.109/V2/:path*',
//             },
//         ];
//     },
//     async redirects() {
//         const basePath = process.env.BASEPATH || '';
//         return [
//             {
//                 source: `${basePath}/`,
//                 destination: `${basePath}/front-pages/landing-page`,
//                 permanent: true,
//                 locale: false
//             },
//             {
//                 source: `${basePath}/:lang(en|fr|ar)`,
//                 destination: `${basePath}/front-pages/landing-page`,
//                 permanent: true,
//                 locale: false
//             },
//             {
//                 source: `${basePath}/:path((?!en|fr|ar|front-pages|images|api|favicon.png).*)*`,
//                 destination: `${basePath}/en/:path*`,
//                 permanent: true,
//                 locale: false
//             }
//         ];
//     },
//     // Important for Vercel
//     output: 'standalone',
// };
// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: false,
    async rewrites() {
        return [
            {
                source: '/api/sms-proxy/:path*',
                destination: 'http://13.200.203.109/V2/:path*',
            },
        ]
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/front-pages/landing-page',
                permanent: false,
            },
        ]
    },
    output: 'standalone',
}
export default nextConfig
