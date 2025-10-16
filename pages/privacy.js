import Head from "next/head";
import Link from "next/link";
import AdSense from "../components/AdSense";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Plant vs Brainrots</title>
        <meta
          name="description"
          content="Read the privacy policy for Plant vs Brainrots to understand how we handle your data."
        />
        <meta
          name="keywords"
          content="plant vs brainrots, privacy policy, data protection, pvb"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/privacy" />
      </Head>
      <div className="page-wrap">
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </nav>
          <h1>Privacy Policy</h1>
        </header>
        <main>
          <section>
            <h2>Introduction</h2>
            <p>
              At Plant vs Brainrots, we are committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your
              information when you visit our website.
            </p>
            <h2>Data Collection</h2>
            <p>
              We collect data from Discord embeds to display real-time stock updates
              for the Plant vs Brainrots game. We do not collect personal
              information unless you explicitly provide it, such as through our
              community platforms (Discord or WhatsApp) or by contacting us
              directly.
            </p>
            <h2>Use of Data</h2>
            <p>
              The data we collect is used solely to provide stock updates and
              improve your experience on our site. We do not share or sell your
              information to third parties.
            </p>
            <h2>Cookies</h2>
            <p>
              Our site may use cookies to enhance user experience. You can disable
              cookies in your browser settings, but this may affect site
              functionality.
            </p>
            <h2>Third-Party Services</h2>
            <p>
              We use Google AdSense to display ads and Google Analytics to track
              site performance. These services may collect data as described in
              their respective privacy policies.
            </p>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us
              at <a href="mailto:support@plantvsbrainrots.com">support@plantvsbrainrots.com</a> or join our{" "}
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