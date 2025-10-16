// pages/privacy-policy.js
import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Plant vs Brainrots Tracker</title>
        <meta
          name="description"
          content="Privacy policy for plantvsbrainrots.vercel.app. We respect your privacy and do not collect personal data."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/privacy-policy" />
      </Head>

      <div className="page-wrap">
        <header className="site-header">
          <div className="header-left" style={{ textAlign: "left" }}>
            <h1 className="site-title">🔒 Privacy Policy</h1>
            <p className="site-sub">Last updated: October 17, 2025</p>
          </div>
        </header>

        <main className="policy-content">
          <p>
            This Privacy Policy explains how <strong>plantvsbrainrots.vercel.app</strong> ("we", "our", "us") handles your data.
          </p>

          <h3>1. No Personal Data Collected</h3>
          <p>
            Our website does NOT collect, store, or process any personal information from visitors. We do not use cookies for tracking.
          </p>

          <h3>2. Data Source</h3>
          <p>
            All displayed data (seed and gear stock) is pulled from public Discord bot messages. This data is not associated with any individual user.
          </p>

          <h3>3. Third-Party Services</h3>
          <p>
            We use Google AdSense to display ads. Google may use cookies to serve ads based on your prior visits. You can opt out via <a href="https://adssettings.google.com/" target="_blank" rel="noopener">Google’s Ad Settings</a>.
          </p>

          <h3>4. Changes to This Policy</h3>
          <p>
            We may update this policy. The updated version will be posted here with a new "Last updated" date.
          </p>

          <h3>5. Contact Us</h3>
          <p>
            Questions? Join our <a href="https://discord.gg/Bun8HKKQ3D" target="_blank" rel="noopener">Discord server</a>.
          </p>
        </main>

        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} iRexus
          </span>
        </footer>
      </div>

      <style jsx>{`
        .policy-content {
          background: var(--panel);
          border-radius: 12px;
          padding: 24px;
          line-height: 1.7;
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .policy-content h3 {
          color: #fff;
          margin: 20px 0 10px;
          font-size: 1.3rem;
        }
        .policy-content p, .policy-content li {
          margin-bottom: 12px;
        }
        .policy-content a {
          color: var(--accent);
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
