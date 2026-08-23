export const site = {
  name: 'Surinder Singh',
  title: 'Surinder Singh — Software, Systems, Business',
  description: 'Surinder Singh builds software and writes about systems, business, people, constraints, retention, and simplification.',
  url: 'https://surindersingh.co',
  email: 'singhsurinderny@gmail.com',
  github: 'https://github.com/surinderpalsingh',
  x: 'https://x.com/0xsurinder',
  organization: {
    name: 'Parlor',
    url: 'https://getparlor.ai',
  },
} as const;

export const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${site.url}/#person`,
      name: site.name,
      alternateName: 'Surinderpal Singh',
      url: site.url,
      email: `mailto:${site.email}`,
      description: site.description,
      sameAs: [site.github, site.x],
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'The Cooper Union',
        url: 'https://cooper.edu',
      },
      worksFor: {
        '@id': `${site.url}/#organization`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.organization.name,
      url: site.organization.url,
      email: site.email,
      founder: {
        '@id': `${site.url}/#person`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: site.email,
        contactType: 'business inquiries',
        availableLanguage: 'English',
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      alternateName: site.title,
      description: site.description,
      inLanguage: 'en-US',
      author: {
        '@id': `${site.url}/#person`,
      },
      publisher: {
        '@id': `${site.url}/#person`,
      },
    },
  ],
};

export function articleStructuredData(article: {
  title: string;
  slug: string;
  dateLabel: string;
  description: string;
  date: string;
}) {
  const isoDate = `2026-${article.date.replace('/', '-')}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: isoDate,
    dateModified: isoDate,
    mainEntityOfPage: `${site.url}/writing/${article.slug}`,
    author: {
      '@type': 'Person',
      '@id': `${site.url}/#person`,
      name: site.name,
      url: site.url,
    },
    publisher: {
      '@id': `${site.url}/#person`,
    },
  };
}
