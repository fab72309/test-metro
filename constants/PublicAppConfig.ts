const GITHUB_REPOSITORY_URL = 'https://github.com/fab72309/test-metro';

function normalizeString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeUrl(value?: string | null) {
  const trimmed = normalizeString(value);
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, '');
}

const publicSiteUrl = normalizeUrl(process.env.EXPO_PUBLIC_SITE_URL);
const supportEmail = normalizeString(process.env.EXPO_PUBLIC_SUPPORT_EMAIL);

export const PUBLIC_APP_CONFIG = {
  productName: 'Hydraulique Opérationnelle',
  repositoryUrl: GITHUB_REPOSITORY_URL,
  issuesUrl: `${GITHUB_REPOSITORY_URL}/issues`,
  supportEmail,
  supportEmailUrl: supportEmail ? `mailto:${supportEmail}` : null,
  publicSiteUrl,
  supportPageUrl: publicSiteUrl ? `${publicSiteUrl}/support` : null,
  privacyPolicyPageUrl: publicSiteUrl ? `${publicSiteUrl}/privacy-policy` : null,
};
