import React from 'react';
import { Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com/warrior_aashuu", label: "Twitter" },
    { icon: <Github className="h-5 w-5" />, href: "https://github.com/codeaashu", label: "GitHub" },
    { icon: <Linkedin className="h-5 w-5" />, href: "https://www.linkedin.com/in/ashutoshkumaraashu/", label: "LinkedIn" },
  ];

  return (
    <div className="max-w-8xl mx-auto px-6 py-4">
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>

        <div className="text-sm text-slate-400">
          Built by{' '}
          <a
            href="https://github.com/codeaashu"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-400 transition-colors"
          >
            <b>aashuu</b>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
