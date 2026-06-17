import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description: string;
  path: string; // e.g. "/opportunities" — used to build canonical + OG URL
  /** Optional override for og:title if different from <title> */
  ogTitle?: string;
}

const SITE = "https://sinacommercial.ca";
const OG_IMAGE = `${SITE}/og-image.png`;
const TWITTER_IMAGE = `${SITE}/twitter-card.png`;

export default function PageMeta({ title, description, path, ogTitle }: PageMetaProps) {
  const url = `${SITE}${path}`;
  const ogTitleFinal = ogTitle ?? title;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitleFinal} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogTitleFinal} />
      <meta property="og:site_name" content="Sina Commercial" />
      <meta property="og:locale" content="en_CA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitleFinal} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={TWITTER_IMAGE} />
      <meta name="twitter:image:alt" content={ogTitleFinal} />
    </Helmet>
  );
}
