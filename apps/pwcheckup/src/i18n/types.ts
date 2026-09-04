export interface PageSection {
  heading: string;
  paragraphs: string[];
}

export interface StaticPageCopy {
  title: string;
  description: string;
  sections: PageSection[];
}

export interface Dictionary {
  nav: {
    brand: string;
    guides: string;
    about: string;
    faq: string;
    language: string;
  };
  hero: {
    headlinePhrases: string[];
    sub: string;
  };
  checker: {
    inputLabel: string;
    inputPlaceholder: string;
    show: string;
    hide: string;
    checkButton: string;
    checkingLabel: string;
    trustTitle: string;
    trustPoints: string[];
  };
  result: {
    idleHint: string;
    safeTitle: string;
    safeBody: string;
    breachedTitle: string;
    breachedBody: string;
    errorTitle: string;
    errorBody: string;
    strength: {
      label: string;
      weak: string;
      fair: string;
      good: string;
      strong: string;
    };
  };
  share: {
    title: string;
    kakao: string;
    native: string;
    copyLink: string;
    copied: string;
    promoText: string;
  };
  footer: {
    tagline: string;
    company: string;
    legal: string;
    rights: string;
    guidesHeading: string;
    aboutLink: string;
    contactLink: string;
    privacyLink: string;
    termsLink: string;
    faqLink: string;
  };
  home: {
    trustBadges: { title: string; desc: string }[];
  };
  pages: {
    home: { title: string; description: string };
    about: StaticPageCopy;
    privacyPolicy: StaticPageCopy & { lastUpdated: string };
    termsOfService: StaticPageCopy & { lastUpdated: string };
    contact: { title: string; description: string; body: string; buttonLabel: string };
    faq: { title: string; description: string };
    guidesIndex: { title: string; description: string };
    notFound: { title: string; heading: string; body: string; back: string };
  };
}
