import React from 'react';

export interface FooterProps {
  /**
   * Content to be displayed in the footer
   * @example <div>Custom footer content</div>
   */
  children: React.ReactNode;

  /**
   * Copyright text to display
   * @example "© 2024 My Company"
   */
  copyright?: string;

  /**
   * Additional CSS class names
   * @hideInDocs
   */
  className?: string;

  /**
   * Footer variant style
   * @renderVariants true
   * @displayTemplate {variant} Footer
   */
  variant?: 'default' | 'compact' | 'detailed';

  /**
   * Show social media links
   */
  showSocial?: boolean;

  /**
   * Social media links
   */
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

/**
 * Footer component for page layouts
 *
 * A flexible footer component that supports copyright text, social links,
 * and custom content through children.
 */
export const Footer: React.FC<FooterProps> = ({
  children,
  copyright,
  className = '',
  variant = 'default',
  showSocial = false,
  socialLinks,
}) => {
  const baseClasses = 'footer';
  const variantClasses = {
    default: 'footer--default',
    compact: 'footer--compact',
    detailed: 'footer--detailed',
  };

  const footerClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <footer className={footerClasses}>
      <div className="footer__content">
        {children}

        {copyright && (
          <div className="footer__copyright">
            {copyright}
          </div>
        )}

        {(showSocial && socialLinks) && (
          <div className="footer__social">
            {socialLinks.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="GitHub"
              >
                GitHub
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="Twitter"
              >
                Twitter
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};