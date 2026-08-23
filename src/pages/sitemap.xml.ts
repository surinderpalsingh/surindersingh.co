import type { APIRoute } from 'astro';
import { ideas } from '../data/ideas';
import { site } from '../data/site';

export const prerender = true;

const staticRoutes = [
  { path: '/', lastmod: '2026-08-23' },
  { path: '/about', lastmod: '2026-08-23' },
  { path: '/contact', lastmod: '2026-08-23' },
  { path: '/privacy', lastmod: '2026-08-23' },
  { path: '/writing', lastmod: '2026-08-16' },
];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] ?? character);
}

export const GET: APIRoute = () => {
  const articleRoutes = ideas.map((idea) => ({
    path: `/writing/${idea.slug}`,
    lastmod: `2026-${idea.date.replace('/', '-')}`,
  }));
  const urls = [...staticRoutes, ...articleRoutes]
    .map(({ path, lastmod }) => `  <url>\n    <loc>${escapeXml(new URL(path, site.url).toString())}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
