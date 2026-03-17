"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{siteConfig.name}</h3>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {siteConfig.navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Resources</h4>
            <nav className="flex flex-col gap-2">
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Next.js
              </a>
              <a
                href="https://tailwindcss.com"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Tailwind CSS
              </a>
              <a
                href="https://ui.shadcn.com"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                shadcn/ui
              </a>
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Follow Us</h4>
            <nav className="flex flex-col gap-2">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <span>·</span>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <span>·</span>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
