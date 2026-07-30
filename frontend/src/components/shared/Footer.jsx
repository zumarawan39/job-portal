import React from 'react';
import { Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/browse', label: 'Browse' },
];

// Simple footer with brand + quick links, shown on every page
const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-display text-lg font-bold tracking-tight">
              Job<span className="text-brand-orange">Portal</span>
            </span>
            <p className="mt-1 text-sm text-muted-foreground">Search jobs, get matched by skill, and manage every application in one place.</p>
          </div>
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} JobPortal. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
