import type { Dictionary } from "../types";

const en: Dictionary = {
  nav: {
    guides: "Guides",
    about: "About",
    faq: "FAQ",
    language: "한국어",
  },
  hero: {
    headlinePhrases: ["Is my password safe?", "Check it right now"],
    sub: "Enter a password and we'll safely check whether it's appeared in a known data breach. Your password is never sent to any server.",
  },
  checker: {
    inputLabel: "Enter password",
    inputPlaceholder: "Type the password you want to check",
    show: "Show",
    hide: "Hide",
    checkButton: "Check if it's safe",
    checkingLabel: "Checking...",
    trustTitle: "Why is this safe?",
    trustPoints: [
      "Your password never leaves this browser. It's never stored or transmitted to any server, ever.",
      "Your browser converts the password into a SHA-1 hash, then sends only the first 5 characters of that hash to our API.",
      "The server returns a list of hundreds of hashes that share those first 5 characters — it never learns which password you're actually checking (this is called \"k-anonymity\").",
      "The match is compared locally, inside your browser. Curious how it works? Read the full explanation in our guides.",
    ],
  },
  result: {
    idleHint: "Enter a password and press the check button.",
    safeTitle: "You're safe",
    safeBody: "This password wasn't found in any known breach. If you're reusing it elsewhere though, it's still worth changing.",
    breachedTitle: "This password has been breached",
    breachedBody: "This password has appeared {count} times in known data breaches. If you're using it now, please change it right away.",
    errorTitle: "Check failed",
    errorBody: "A temporary network error prevented the check. Please try again in a moment.",
    strength: {
      label: "Password strength",
      weak: "Weak",
      fair: "Fair",
      good: "Good",
      strong: "Very strong",
    },
  },
  share: {
    title: "Share with a friend",
    kakao: "Share on KakaoTalk",
    native: "Share",
    copyLink: "Copy link",
    copied: "Copied",
    promoText: "Is your password safe? Check it for free, privately — PW Checkup",
  },
  footer: {
    tagline: "Check if your password has been breached, safely inside your browser.",
    company: "Company",
    legal: "Legal",
    rights: "Every check happens entirely inside this browser — your password is never transmitted.",
    guidesHeading: "Guides",
    aboutLink: "About",
    contactLink: "Contact",
    privacyLink: "Privacy Policy",
    termsLink: "Terms of Service",
    faqLink: "FAQ",
  },
  home: {
    trustBadges: [
      { title: "100% private", desc: "Your password is never sent anywhere" },
      { title: "No sign-up", desc: "Just type and check" },
      { title: "Free", desc: "No limits, completely free" },
      { title: "k-anonymity", desc: "Industry-standard privacy method" },
    ],
  },
  pages: {
    home: {
      title: "Is My Password Safe? | PW Checkup",
      description:
        "Check whether your password has appeared in a known data breach, for free, safely. Your password is never sent to a server — everything happens right in your browser.",
    },
    about: {
      title: "About",
      description: "Learn what PW Checkup is, why it's free, and why your password stays safe.",
      sections: [
        {
          heading: "What is PW Checkup?",
          paragraphs: [
            "PW Checkup is a free tool for checking whether a password you use has appeared in a known data breach. No sign-up, no install — it runs entirely in your web browser.",
          ],
        },
        {
          heading: "Why is it free?",
          paragraphs: [
            "This service is built on the widely-trusted \"Have I Been Pwned\" Pwned Passwords database. We've added a privacy-safe k-anonymity lookup flow, clear bilingual explanations, and a trustworthy interface on top of it.",
          ],
        },
        {
          heading: "Your password is never transmitted",
          paragraphs: [
            "Every check happens inside your own browser. Your password is hashed with SHA-1 locally, and only the first 5 characters of that hash are sent for lookup. Your full password — and full hash — never reach any server. See our guides for the full technical explanation.",
          ],
        },
        {
          heading: "Who's behind this",
          paragraphs: [
            "PW Checkup is an independent, small-scale project focused on one thing: password security. If you have feedback or run into an issue, see our Contact page.",
          ],
        },
      ],
    },
    privacyPolicy: {
      title: "Privacy Policy",
      description: "How PW Checkup handles your data. In short: your password is never sent to any server.",
      lastUpdated: "September 4, 2026",
      sections: [
        {
          heading: "The password you type",
          paragraphs: [
            "PW Checkup checks password breach status entirely client-side, inside your browser. The password you enter is hashed locally using the Web Crypto API's SHA-1 implementation.",
            "Only the first 5 hex characters of that hash are sent to the Have I Been Pwned Pwned Passwords API. The server returns a list of hundreds of hash suffixes that share that same prefix — it has no way of knowing which password (or even which full hash) you're actually checking. The comparison against your full hash happens locally, in your browser, after the response arrives.",
            "In other words, your full password and full hash are never transmitted to, or stored by, any server in any form. We cannot see or know the password you enter.",
          ],
        },
        {
          heading: "Analytics",
          paragraphs: [
            "We may use privacy-respecting analytics to understand aggregate traffic patterns (e.g. which pages are visited, approximate country of origin). This data is anonymized/aggregated and is never linked to any password you enter or check.",
          ],
        },
        {
          heading: "Advertising",
          paragraphs: [
            "This site may display advertising served by Google AdSense. Google and its partners may use cookies or similar technologies to serve ads based on your prior visits to this or other websites. You can opt out of personalized advertising via Google's Ads Settings.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "This site itself does not set cookies for the password-check functionality. Third-party services we use (analytics, advertising, once enabled) may set their own cookies, governed by their own privacy policies.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Depending on your location, you may have rights under regulations such as the GDPR or CCPA to access, correct, or delete personal data we hold about you. Since we don't collect personal data tied to your password checks, there's generally nothing of that nature to request. For questions, see our Contact page.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: ["We may update this policy from time to time. Changes will be posted on this page with an updated revision date."],
        },
      ],
    },
    termsOfService: {
      title: "Terms of Service",
      description: "The terms governing your use of PW Checkup.",
      lastUpdated: "September 4, 2026",
      sections: [
        {
          heading: "Acceptance of terms",
          paragraphs: ["By using PW Checkup, you agree to these Terms of Service. If you don't agree, please don't use the site."],
        },
        {
          heading: "Use of the service",
          paragraphs: ["PW Checkup provides a free, client-side password breach-check tool. You may use it for personal or commercial purposes, subject to these terms."],
        },
        {
          heading: "No warranty",
          paragraphs: ["This service is provided \"as is,\" without warranty of any kind, express or implied. We don't guarantee results are exhaustive or error-free — very recent breaches may not yet be reflected in the underlying Pwned Passwords database."],
        },
        {
          heading: "Limitation of liability",
          paragraphs: ["To the fullest extent permitted by law, PW Checkup and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of this service."],
        },
        {
          heading: "Acceptable use",
          paragraphs: ["You agree not to use this service to check passwords belonging to others without authorization, or for any unlawful purpose."],
        },
        {
          heading: "Changes",
          paragraphs: ["We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the updated terms."],
        },
        {
          heading: "Contact",
          paragraphs: ["Questions about these terms? See our Contact page."],
        },
      ],
    },
    contact: {
      title: "Contact",
      description: "Send us your questions or feedback about PW Checkup.",
      body: "Found a bug, have a feature suggestion, or just have a question? Reach out any time by email.",
      buttonLabel: "Send an email",
    },
    faq: {
      title: "FAQ",
      description: "Frequently asked questions about using PW Checkup.",
    },
    guidesIndex: {
      title: "Guides",
      description: "Learn more about password security.",
    },
    notFound: {
      title: "Page not found",
      heading: "Page not found",
      body: "The page you're looking for doesn't exist or has moved.",
      back: "Go back home",
    },
  },
};

export default en;
