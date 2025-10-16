// pages/guide.js
import Head from "next/head";
import Link from "next/link";

export default function Guide() {
  return (
    <>
      <Head>
        <title>Plant vs Brainrots - Beginner's Guide</title>
        <meta
          name="description"
          content="Complete beginner's guide to Plant vs Brainrots on Roblox. Learn how to farm, trade seeds, use gear, and dominate the game."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/guide" />
      </Head>

      <div className="page-wrap">
        <header className="site-header">
          <div className="header-left" style={{ textAlign: "left" }}>
            <h1 className="site-title">📖 Beginner's Guide</h1>
            <p className="site-sub"> Plant vs Brainrots </p>
          </div>
        </header>

        <main className="guide-content">
          <h2>Welcome to Plant vs Brainrots!</h2>
          <p>
            <em>Plant vs Brainrots</em> is a strategic farming and PvP game on Roblox where players grow plants, collect rare seeds, and battle others using unique gear. This guide will help you get started and become a top farmer.
          </p>

          <h3>1. Understanding Seeds</h3>
          <p>
            Seeds are the core of the game. Each seed grows into a plant that produces resources or has special abilities. Common seeds include Sunflower and Strawberry, while rare ones like Dragon Fruit and Carnivorous Plant can give you a huge advantage.
          </p>
          <p>
            <strong>Tip:</strong> Always check the shop every 5 minutes—rare seeds sell out fast!
          </p>

          <h3>2. Using Gear Effectively</h3>
          <p>
            Gear like the Banana Gun, Frost Blower, and Carrot Launcher can destroy enemy farms or protect yours. Water Bucket heals your plants, while Frost Grenade slows attackers.
          </p>
          <p>
            Combine gear strategically: use Frost Blower to freeze enemies, then attack with Carrot Launcher!
          </p>

          <h3>3. Trading & Economy</h3>
          <p>
            Join our <a href="https://discord.gg/Bun8HKKQ3D" target="_blank" rel="noopener">Discord</a> or <a href="https://chat.whatsapp.com/Im4P6NtHraMLmiILNQvcOE" target="_blank" rel="noopener">WhatsApp</a> to trade seeds. Rare seeds can be worth thousands of in-game coins.
          </p>

          <h3>4. Pro Tips</h3>
          <ul>
            <li>Always keep backup seeds in your inventory.</li>
            <li>Upgrade your farm layout for better defense.</li>
            <li>Watch for shop refreshes—use our live tracker!</li>
            <li>Team up with friends for luck increase.</li>
          </ul>

          <p>
            Ready to dominate? Return to the <Link href="/">live stock tracker</Link> and grab the best items before they’re gone!
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
        .guide-content {
          background: var(--panel);
          border-radius: 12px;
          padding: 24px;
          line-height: 1.7;
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .guide-content h2 {
          color: var(--yellow);
          margin: 16px 0 12px;
          font-size: 1.6rem;
        }
        .guide-content h3 {
          color: #fff;
          margin: 20px 0 10px;
          font-size: 1.3rem;
        }
        .guide-content p, .guide-content li {
          margin-bottom: 12px;
        }
        .guide-content a {
          color: var(--accent);
          text-decoration: underline;
        }
        .guide-content ul {
          padding-left: 20px;
          margin: 12px 0;
        }
      `}</style>
    </>
  );
}
