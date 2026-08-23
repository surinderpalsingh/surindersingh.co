const articleSlugs = [
  'code-is-not-the-constraint',
  'agents-and-shipping-new-features-should-be-rarer',
  'find-the-constraint',
  'retention-is-the-business',
  'delete-before-you-automate',
  'people-are-not-logical-systems',
];

const markdownRoutes = new Map([
  ['/', '/index.md'],
  ['/about', '/about.md'],
  ['/contact', '/contact.md'],
  ['/privacy', '/privacy.md'],
  ['/writing', '/writing/index.md'],
  ['/ideas', '/writing/index.md'],
  ['/writing/hook-getter', '/writing/hook-getter.md'],
  ...articleSlugs.flatMap((slug) => [
    [`/writing/${slug}`, `/writing/${slug}.md`],
    [`/ideas/${slug}`, `/writing/${slug}.md`],
  ]),
]);

function normalizePath(pathname) {
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

function parseAccept(acceptHeader) {
  if (!acceptHeader) return [];

  return acceptHeader
    .split(',')
    .map((entry, index) => {
      const [rawType, ...parameters] = entry.trim().toLowerCase().split(';');
      const [type, subtype] = rawType.split('/');
      if (!type || !subtype) return null;

      let quality = 1;
      for (const parameter of parameters) {
        const [name, rawValue] = parameter.trim().split('=');
        if (name === 'q') {
          const parsed = Number(rawValue);
          quality = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
        }
      }

      const specificity = type === '*' ? 0 : subtype === '*' ? 1 : 2;
      return { type, subtype, quality, specificity, index };
    })
    .filter(Boolean)
    .sort((a, b) => b.quality - a.quality || b.specificity - a.specificity || a.index - b.index);
}

function negotiateContentType(acceptHeader) {
  if (!acceptHeader) return 'text/html';

  for (const range of parseAccept(acceptHeader)) {
    if (range.quality === 0) continue;
    if (range.type === 'text' && range.subtype === 'markdown') return 'text/markdown';
    if (range.type === 'text' && range.subtype === 'html') return 'text/html';
    if ((range.type === 'text' && range.subtype === '*') || (range.type === '*' && range.subtype === '*')) {
      return 'text/html';
    }
  }

  return null;
}

function setVariantHeaders(headers, markdownPath) {
  const existingVary = headers.get('Vary')?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];
  const vary = new Map(existingVary.map((value) => [value.toLowerCase(), value]));
  vary.set('accept', 'Accept');
  vary.set('accept-encoding', 'Accept-Encoding');
  headers.set('Vary', [...vary.values()].join(', '));

  const links = ['</llms.txt>; rel="describedby"'];
  if (markdownPath) links.unshift(`<${markdownPath}>; rel="alternate"; type="text/markdown"`);
  headers.set('Link', links.join(', '));
}

function markdownNotFound(url, method) {
  const body = `# 404 — Page not found

The requested path \`${new URL(url).pathname}\` does not exist.

- [Home](https://surindersingh.co/index.md)
- [Writing](https://surindersingh.co/writing/index.md)
- [Agent instructions](https://surindersingh.co/llms.txt)
- [XML sitemap](https://surindersingh.co/sitemap.xml)
`;
  const headers = new Headers({
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  });
  setVariantHeaders(headers);
  return new Response(method === 'HEAD' ? null : body, { status: 404, headers });
}

async function serveMarkdown(request, env, markdownPath) {
  if (!markdownPath) return markdownNotFound(request.url, request.method);

  const assetUrl = new URL(markdownPath, request.url);
  const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, { method: 'GET' }));
  if (!assetResponse.ok) return markdownNotFound(request.url, request.method);

  const headers = new Headers(assetResponse.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Content-Location', new URL(request.url).pathname);
  setVariantHeaders(headers, markdownPath);

  return new Response(request.method === 'HEAD' ? null : assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}

async function serveHtml(request, env, markdownPath) {
  const assetResponse = await env.ASSETS.fetch(request);
  const headers = new Headers(assetResponse.headers);
  setVariantHeaders(headers, markdownPath);
  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return env.ASSETS.fetch(request);
    }

    const path = normalizePath(new URL(request.url).pathname);
    const markdownPath = markdownRoutes.get(path);
    const representation = negotiateContentType(request.headers.get('Accept'));

    if (!representation) {
      const headers = new Headers({
        'Content-Type': 'text/plain; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding',
      });
      return new Response(request.method === 'HEAD' ? null : 'Not acceptable. Available representations: text/html, text/markdown.\n', {
        status: 406,
        headers,
      });
    }

    if (representation === 'text/markdown') {
      return serveMarkdown(request, env, markdownPath);
    }

    return serveHtml(request, env, markdownPath);
  },
};

export { markdownRoutes, negotiateContentType, normalizePath, parseAccept, setVariantHeaders };
