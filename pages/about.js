import Head from "next/head";
import Link from "next/link";
import AdSense from "../components/AdSense";

export default function About() {
  return (
    <>
      <Head>
        <title>About Plant vs Brainrots</title>
        <meta
          name="description"
          content="Learn about Plant vs Brainrots, a fun and engaging game. Discover tips, tricks, and the importance of tracking seeds and gear."
        />
        <meta
          name="keywords"
          content="plant vs brainrots, about, game guide, seeds, gear, pvb"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/about" />
      </Head>
      <div className="page-wrap">
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </nav>
          <h1>About Plant vs Brainrots</h1>
        </header>
        <main>
          <section>
            <h2>What is Plant vs Brainrots?</h2>
            <p>
              Plant vs Brainrots is an exciting strategy game where players collect
              unique seeds and gear to battle opponents. Each seed grows into a
              powerful plant with special abilities, while gear provides tactical
              advantages in battles. Our site helps you stay ahead by providing
              real-time updates on in-game shop stock, pulled directly from Discord
              embeds.
            </p>
            <h2>Why Track Seeds and Gear?</h2>
            <p>
              The in-game shop frequently updates its stock, and rare items like
              Dragon Fruit Seeds or Carrot Launchers can sell out quickly. By
              tracking stock in real-time, you can plan your purchases and optimize
              your gameplay strategy.
            </p>
            <h2>Tips for Players</h2>
            <ul>
              <li>
                <strong>Prioritize Rare Seeds</strong>: Seeds like Dragon Fruit and
                Carnivorous Plant are rare and offer powerful abilities.
              </li>
              <li>
                <strong>Use Gear Strategically</strong>: Items like the Carrot
                Launcher can turn the tide in tough battles.
              </li>
              <li>
                <strong>Join the Community</strong>: Connect with other players on
                our <a href="https://discord.gg/Bun8HKKQ3D">Discord</a> or{" "}
                <a href="https://chat.whatsapp.com/Im4P6NtHraMLmiILNQvcOE">
                  WhatsApp
                </a>{" "}
                for trading tips and updates.
              </li>
            </ul>
            <h2>Our Mission</h2>
            <p>
              Our goal is to provide a reliable and user-friendly platform for
              Plant vs Brainrots players to track shop stock and improve their
              gameplay experience. We update our data every 5 minutes to ensure
              accuracy.
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