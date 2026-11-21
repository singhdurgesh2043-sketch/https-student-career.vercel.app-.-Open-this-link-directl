/**
 * Centralized Application Branding Configuration
 * All visual identity, metadata, links, and design tokens for Student Career App.
 */

export interface AppBranding {
  appName: string;
  shortName: string;
  companyName: string;
  tagline: string;
  packageId: string;
  supportEmail: string;
  officialWebsite: string;
  githubRepo: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    background: string;
    surface: string;
  };
  endpoints: {
    updateManifestUrl: string;
    updateManifestFallbackUrl: string;
    releasesPageUrl: string;
  };
}

export const BRANDING: AppBranding = {
  appName: 'Student Career App',
  shortName: 'Student Career',
  companyName: 'Student Career Coaching & Tuition Management',
  tagline: 'Professional Coaching & Tuition Centre Management',
  packageId: 'com.studentcareer.app',
  supportEmail: 'support@studentcareer.app',
  officialWebsite: 'https://studentcareerapp.vercel.app',
  githubRepo: 'https://github.com/singhdurgesh2043-sketch/https-student-career.vercel.app-.-Open-this-link-directl',
  colors: {
    primary: '#1e3a8a',      // Navy 900
    primaryDark: '#0f172a',  // Slate 900
    primaryLight: '#2563eb', // Blue 600
    accent: '#10b981',       // Emerald 500
    background: '#f8fafc',   // Slate 50
    surface: '#ffffff',
  },
  endpoints: {
    updateManifestUrl: 'https://raw.githubusercontent.com/singhdurgesh2043-sketch/https-student-career.vercel.app-.-Open-this-link-directl/main/public/version.json',
    updateManifestFallbackUrl: '/version.json',
    releasesPageUrl: 'https://github.com/singhdurgesh2043-sketch/https-student-career.vercel.app-.-Open-this-link-directl/releases',
  },
};
