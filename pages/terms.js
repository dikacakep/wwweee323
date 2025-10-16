import Head from "next/head";
import Link from "next/link";
import AdSense from "../components/AdSense";

export default function TermsOfUse() {
  return (
    <>
      <Head>
        <title>Terms of Use - Plant vs Brainrots</title>
        <meta
          name="description"
          content="Read the terms of use for Plant vs Brainrots to understand the rules for using our website."
        />
        <meta
          name="keywords"
          content="plant vs brainrots, terms of use, website rules, pvb"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/terms" />
      </Head>
      <div className="page-wrap">
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </nav>
          <h1>Terms of Use</h1>
        </header>
        <main>
          <section>
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing Plant vs Brainrots, you agree to be bound by these Terms
              of Use. If you do not agree, please do not use our website.
            </p>
            <h2>Use of Content</h2>
            <p>
              The content on this site, including stock data and game information,
              is provided for informational purposes only. You may not reproduce or
              distribute our content without permission.
            </p>
            <h2>User Conduct</h2>
            <p>
              You agree not to use our site for any unlawful purpose or to disrupt
              its functionality. Any misuse may result in restricted access.
            </p>
            <h2>Third-Party Links</h2>
            <p>
              Our site contains links to third-party platforms like Discord and
              WhatsApp. We are not responsible for the content or practices of these
              sites.
            </p>
            <h2>Contact Us</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:support@plantvsbrainrots.com">support@plantvsbrainrots.com</a> or join our{" "}
              <a href="https://discord.gg/Bun8HKKQ3D">Discord</a>.
            </p>
          </section>
          <AdSense adSlot="your-ad-slot-id" />
        </main>
        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} iRexus • Data displayed from Discord
            embeds
          </span>
          <nav>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </nav>
        </footer>
      </div>
    </>
  );
}