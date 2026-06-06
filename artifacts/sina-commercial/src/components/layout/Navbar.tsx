import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import sinaLogoPath from "@assets/Sina_Logo_V3_Navy_Blue_1780720012133.png";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [location] = useLocation();

  const navLinks = [
    { name: "Opportunities", href: "/opportunities" },
    { name: "Search Properties", href: "/search-properties" },
    { name: "Market Intelligence", href: "/market-intelligence" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                src={sinaLogoPath}
                alt="Sina Commercial"
                className="h-14 sm:h-16 w-auto"
              />
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex lg:items-center lg:gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors relative pb-0.5 ${
                  isActive(link.href)
                    ? "text-secondary after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-secondary"
                    : "text-foreground/75 hover:text-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-white font-medium rounded-sm px-5 text-sm h-10"
            >
              <Link href="/contact">Request Confidential Opportunities</Link>
            </Button>
          </div>

          {/* MOBILE MENU */}
          <div className="flex lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-l border-white/10 w-[280px] sm:w-[360px]">
                <div className="pt-4 pb-2">
                  <img src={sinaLogoPath} alt="Sina Commercial" className="h-12 w-auto mb-8" />
                </div>
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-3 py-3 text-base font-medium rounded-sm transition-colors ${
                        isActive(link.href)
                          ? "text-secondary bg-secondary/10"
                          : "text-foreground hover:text-secondary hover:bg-white/5"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="pt-4 mt-2 border-t border-white/10">
                    <Button
                      asChild
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm"
                    >
                      <Link href="/contact" onClick={() => setIsOpen(false)}>
                        Request Confidential Opportunities
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
