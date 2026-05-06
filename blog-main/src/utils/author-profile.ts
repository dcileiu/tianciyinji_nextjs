import { siteConfig } from '@/lib/site-config';

const DEFAULT_AUTHOR_NAME = siteConfig.name;
const DEFAULT_AUTHOR_AVATAR = siteConfig.avatar;

export interface AuthorProfile {
  name: string;
  avatar: string;
}

export function resolveAuthorProfile(author?: string | null, authorAvatar?: string | null): AuthorProfile {
  const normalizedName = author?.trim() || DEFAULT_AUTHOR_NAME;
  const explicitAvatar = authorAvatar?.trim();

  if (explicitAvatar) {
    return {
      name: normalizedName,
      avatar: explicitAvatar,
    };
  }

  return {
    name: normalizedName,
    avatar: DEFAULT_AUTHOR_AVATAR,
  };
}
