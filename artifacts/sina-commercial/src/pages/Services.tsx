import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users, Home, TrendingUp, Search, Building, Briefcase, Wrench, BarChart2, ArrowRight
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const SERVICES = [
  {
    icon: Users,
    number: "01",
    title: "Tenant Representation",
    subtitle: "Industrial | Retail | Office | Automotive | Service Commercial",
    description:
      "Finding the right commercial space in the GTA requires more than a search — it requires market knowledge, negotiation experience, and access to opportunities that never appear publicly. Sina Commercial represents commercial tenants across all asset types, ensuring you secure the right space on terms that support your business operations and growth plan.",
    points: [
      "Industrial warehouse and small-bay industrial lease advisory",
      "Retail and service commercial space sourcing",
      "Office and flex space tenant representation",
      "Automotive-specific lease advisory (mechanic, body shop, tire, car wash, dealership)",
      "Lease negotiation, renewal advisory, and incentive structuring",
      "Off-market and broker-network lease sourcing beyond public listings",
    ],
  },
  {
    icon: Home,
    number: "02",
    title: "Buyer Representation",
    subtitle: "Owner-Users | Business Owners | Investors",
    description:
      "Acquiring commercial property in the GTA is a significant decision. Whether you are a business owner seeking to own your operating premises, an investor acquiring income-producing property, or an owner-user building equity while running your business, Sina Commercial provides the market intelligence and advisory support to guide you through the acquisition process.",
    points: [
      "Owner-user acquisition strategy for business operators",
      "Investment property acquisition and cap rate analysis",
      "Off-market and broker-network property sourcing",
      "Due diligence support and transaction coordination",
      "Financing strategy guidance and lender referrals",
      "GTA-wide coverage across all commercial asset classes",
    ],
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Investment Advisory",
    subtitle: "Income-Producing Assets | Value-Add | Off-Market Acquisitions",
    description:
      "Commercial real estate investment in the GTA offers both income and appreciation potential across industrial, retail, and office asset classes. Sina Commercial advises investors on acquisition strategy, market positioning, and opportunity identification — including confidential and off-market situations that represent genuine value.",
    points: [
      "Industrial and retail plaza income property acquisition",
      "Value-add and repositioning opportunity identification",
      "Cap rate, cash-on-cash, and return scenario analysis",
      "Multi-tenant commercial property investment advisory",
      "Sale-leaseback opportunity structuring",
      "Long-term portfolio strategy and market intelligence",
    ],
  },
  {
    icon: Building,
    number: "04",
    title: "Landlord & Seller Advisory",
    subtitle: "Leasing | Sales | Repositioning | Private Market Testing",
    description:
      "For commercial property owners considering their next move, Sina Commercial provides confidential advisory on leasing, disposition, and repositioning strategies. Whether you are actively looking to sell or lease, or quietly testing demand before committing to a direction, we bring qualified prospects without unnecessary public exposure.",
    points: [
      "Commercial property leasing strategy and tenant sourcing",
      "Private and public disposition advisory",
      "Quiet market testing before formal listing commitment",
      "Lease renewal and tenant retention strategy",
      "Property repositioning and highest-and-best-use analysis",
      "Landlord representation across industrial, retail, and office assets",
    ],
  },
  {
    icon: Search,
    number: "05",
    title: "Off-Market Acquisition Strategy",
    subtitle: "Beyond Public Listings | Private Buyer Matching",
    description:
      "The most compelling commercial real estate acquisitions in the GTA frequently occur before a property ever reaches public exposure. Sina Commercial maintains an active off-market network of motivated sellers, private opportunities, and broker relationships that provide access to situations unavailable through conventional channels.",
    points: [
      "Private buyer registration and confidential matching",
      "Direct seller and broker-network sourcing",
      "Motivated vendor identification and discreet approach",
      "Power of sale, receivership, and distressed asset monitoring",
      "Sale-leaseback and vendor take-back opportunities",
      "All-sources approach: public listings + broker network + private",
    ],
  },
  {
    icon: Briefcase,
    number: "06",
    title: "Business With Property Advisory",
    subtitle: "Operating Businesses With Real Estate Attached",
    description:
      "For buyers seeking an operating business with the real estate included, Sina Commercial facilitates the identification, evaluation, and acquisition of commercial assets where the property and business are sold as a combined opportunity — providing both operational value and real estate equity in a single transaction.",
    points: [
      "Restaurant with property acquisition advisory",
      "Gas station and car wash business-with-property transactions",
      "Automotive business and facility acquisition",
      "Retail and plaza business acquisition",
      "Industrial business with building acquisition",
      "Combined business and real estate valuation advisory",
    ],
  },
  {
    icon: Wrench,
    number: "07",
    title: "Automotive & Specialized Commercial",
    subtitle: "Mechanic Shops | Body Shops | Tire | Car Wash | Dealerships | Truck Repair",
    description:
      "Automotive and specialized commercial users face the most difficult search process in the GTA commercial market. The combination of zoning requirements, specialized building features, municipal restrictions, and limited supply makes automotive and specialized commercial space genuinely difficult to find without insider market knowledge.",
    points: [
      "Mechanic shop lease and acquisition advisory (licensed and unlicensed use)",
      "Auto body, spray booth, and collision repair facility sourcing",
      "Tire shop and automotive retail property advisory",
      "Car wash and car dealership property acquisition",
      "Truck repair and heavy vehicle service facility sourcing",
      "Zoning, use permission, and municipal approval guidance",
    ],
  },
  {
    icon: BarChart2,
    number: "08",
    title: "Market Intelligence & Site Selection",
    subtitle: "GTA Commercial Data | Submarket Analysis | Strategic Site Advisory",
    description:
      "Informed commercial real estate decisions require current, localized market intelligence — not national reports that obscure GTA-specific conditions. Sina Commercial provides direct access to submarket data, emerging corridor analysis, and strategic site selection support across the Greater Toronto Area, giving clients a competitive advantage in identifying and securing the right location before the opportunity becomes widely known.",
    points: [
      "GTA industrial vacancy, rental rate, and absorption analysis",
      "Emerging investment corridor and infrastructure impact assessment",
      "Submarket comparison and site selection advisory",
      "Zoning, permitted use, and municipal official plan review",
      "Competitive site benchmarking for franchise and operator expansion",
      "Private market intelligence reports for investors and developers",
    ],
  },
];

export default function Services() {
  React.useEffect(() => {
    document.title = "Commercial Real Estate Advisory Services GTA | Sina Commercial";
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* HERO */}
      <section className="pt-20 pb-20 bg-card border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-secondary" />
              <span className="text-secondary font-medium tracking-wider uppercase text-sm">Advisory Services</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-5xl text-white mb-6">
              Commercial Real Estate Advisory Services
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed">
              Strategic advisory for commercial tenants, buyers, investors, owner-users, landlords, sellers, and business owners across the GTA.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeInUp}
                  className={`py-16 border-b border-white/5 ${isEven ? "" : "bg-card"}`}
                >
                  <div className={`container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start ${isEven ? "" : "px-6"}`}>
                    <div className="lg:col-span-4">
                      <div className="flex items-start gap-5">
                        <div className="p-3 bg-card border border-white/10 rounded-sm shrink-0">
                          <Icon className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <div className="text-secondary/50 font-mono text-sm mb-1">{service.number}</div>
                          <h2 className="font-serif text-2xl text-white mb-2">{service.title}</h2>
                          <p className="text-primary text-sm font-medium">{service.subtitle}</p>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-8">
                      <p className="text-muted-foreground leading-relaxed mb-8">{service.description}</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.points.map((point, pi) => (
                          <li key={pi} className="flex items-start gap-3 text-sm text-white/80">
                            <span className="text-secondary mt-0.5 shrink-0">&#8212;</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOOK CONSULTATION CTA */}
      <section className="py-24 bg-card border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="h-px w-24 bg-secondary mx-auto mb-10" />
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Ready to Move Forward?</h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            Whether you are a tenant, buyer, investor, or property owner, Sina Commercial provides the advisory expertise and market access to help you achieve your commercial real estate objectives across the Greater Toronto Area.
          </p>
          <Button
            asChild
            size="lg"
            data-testid="btn-book-consultation"
            className="bg-primary hover:bg-primary/90 text-white rounded-sm px-10 h-14 text-base btn-lift btn-lift-red"
          >
            <Link href="/contact">
              Book Consultation <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
