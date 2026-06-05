import { Github, Mail, Rss } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

interface FooterProps {
  siteName?: string;
  tagline?: string;
}

export default function Footer({ siteName = siteConfig.name, tagline = siteConfig.tagline }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    siteConfig.socials.github ? { name: 'GitHub', href: siteConfig.socials.github, icon: Github } : null,
    { name: 'RSS', href: siteConfig.socials.rss, icon: Rss },
    { name: 'Email', href: siteConfig.socials.email, icon: Mail },
  ].filter(Boolean) as Array<{ name: string; href: string; icon: typeof Github }>;

  return (
    <footer className="relative mt-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="text-[#7f71ab] dark:text-[#b3a3df] hover:text-[#5b3df5] dark:hover:text-[#ece7ff] transition-colors duration-200"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div className="text-[#615488] dark:text-[#c7baf1] text-base">{tagline}</div>

          <div className="text-xs text-[#8779b3] dark:text-[#9e8eca]">
            © {currentYear} {siteName}
          </div>
        </div>
      </div>
    </footer>
  );
}
