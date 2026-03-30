import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/today',
        '/habits',
        '/history',
        '/analytics',
        '/settings',
      ],
    },
    sitemap: 'https://dayisperfect.netlify.app/sitemap.xml',
  }
}
