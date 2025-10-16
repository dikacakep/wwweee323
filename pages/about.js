// pages/about.js
import Head from "next/head";
import Link from "next/link";

export default function About() {
  return (
    <>
      <Head>
        <title>About Plant vs Brainrots Tracker</title>
        <meta
          name="description"
          content="Learn about the Plant vs Brainrots live stock tracker, its purpose, and the team behind it."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/about" />
      </Head>

      <div className="page-wrap">
        <header className="site-header">
          <div className="header-left" style={{ textAlign: "left" }}>
            <h1 className="site-title">ℹ️ About This Site</h1>
            <p className="site-sub">Built for the PvB Community</p>
          </div>
        </header>

        <main className="about-content">
          <p>
            This live stock tracker was created to help players of <em>Plant vs Brainrots</em> (a Roblox game) monitor real-time availability of seeds and gear in the in-game shop.
          </p>
          <p>
            The shop refreshes every 5 minutes with random stock, and rare items often sell out in seconds. Our system pulls data directly from the official Discord bot to give you accurate, up-to-the-second information.
          </p>
          <h3>Why We Built This</h3>
          <p>
            As active players, we noticed many missed opportunities due to lack of real-time data. This tool ensures no player misses a chance to grab a <strong>Mr Carrot Seed</strong> or <strong>Frost Blower</strong> again.
          </p>
          <h3>Open & Transparent</h3>
          <p>
            We do not modify or cache data—we display exactly what the bot posts. All data is sourced from public Discord embeds.
          </p>
          <h3>Join the Community</h3>
          <p>
            We’re part of a growing community of PvB players. Join us on:
          </p>
          <ul>
            <li>
              <a href="https://discord.gg/Bun8HKKQ3D" target="_blank" rel="noopener">Discord</a> – for alerts, trading, and support
            </li>
            <li>
              <a href="https://chat.whatsapp.com/Im4P6NtHraMLmiILNQvcOE" target="_blank" rel="noopener">WhatsApp</a> – for real-time notifications
            </li>
          </ul>
          <p>
            Made with ❤️ by iRexus. Not affiliated with Roblox Corporation.
          </p>
        </main>

        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} iRexus •{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>
          </span>
        </footer>
      </div>

      <style jsx>{`
        .about-content {
          background: var(--panel);
          border-radius: 12px;
          padding: 24px;
          line-height: 1.7;
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .about-content h3 {
          color: #fff;
          margin: 20px 0 10px;
          font-size: 1.3rem;
        }
        .about-content p, .about-content li {
          margin-bottom: 12px;
        }
        .about-content a {
          color: var(--accent);
          text-decoration: underline;
        }
        .about-content ul {
          padding-left: 20px;
          margin: 12px 0;
        }
      `}</style>
    </>
  );
}
