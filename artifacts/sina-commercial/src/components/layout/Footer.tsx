import React from "react";
import { Link } from "wouter";
import sinaLogoPath from "@assets/Sina_Logo_V3_Navy_Blue_1780720012133.png";

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/10 pt-14 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 mb-12">
          {/* BRAND COLUMN */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="mb-6 inline-block">
              <img
                src={sinaLogoPath}
                alt="Sina Commercial"
                className="h-[72px] sm:h-20 w-auto"
              />
            </Link>
            <p className="text-white text-sm font-medium mb-1">Sina Shahravan</p>
            <p className="text-muted-foreground text-sm mb-1">Vice President, Sales Associate</p>
            <p className="text-muted-foreground text-sm mb-6">Nave Real Estate Brokerage Inc.</p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-secondary font-medium w-6 inline-block">M:</span>
                <a href="tel:4167101109" className="text-foreground/80 hover:text-white transition-colors">416-710-1109</a>
              </p>
              <p>
                <span className="text-secondary font-medium w-6 inline-block">O:</span>
                <a href="tel:9055563232" className="text-foreground/80 hover:text-white transition-colors">905-556-3232</a>
              </p>
              <p>
                <span className="text-secondary font-medium w-6 inline-block">E:</span>
                <a href="mailto:sina@sinacommercial.ca" className="text-foreground/80 hover:text-white transition-colors">sina@sinacommercial.ca</a>
              </p>
              <p className="text-muted-foreground pt-1">Greater Toronto Area, Ontario</p>
            </div>
          </div>

          {/* LINKS COLUMNS */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="font-serif text-base font-semibold text-white mb-5 flex items-center gap-3">
                <span className="w-6 h-px bg-secondary inline-block" />
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/opportunities" className="text-muted-foreground hover:text-secondary transition-colors">Opportunities</Link></li>
                <li><Link href="/search-properties" className="text-muted-foreground hover:text-secondary transition-colors">Search Commercial Properties</Link></li>
                <li><Link href="/market-intelligence" className="text-muted-foreground hover:text-secondary transition-colors">Market Intelligence</Link></li>
                <li><Link href="/services" className="text-muted-foreground hover:text-secondary transition-colors">Services</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-secondary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-base font-semibold text-white mb-5 flex items-center gap-3">
                <span className="w-6 h-px bg-primary inline-block" />
                Confidential Access
              </h4>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                Gain access to off-market opportunities, private listings, and institutional commercial real estate intelligence before it hits the open market.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-white transition-colors"
              >
                Request Confidential Opportunities &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground">
          <p>Not intended to solicit buyers or sellers currently under contract.</p>
          <p>&copy; 2026 Sina Commercial. All rights reserved. Brokerage: Nave Real Estate Brokerage Inc.</p>
        </div>
      </div>
    </footer>
  );
}
