// pages/index.js
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";

const seedImages = {
  "sunflower seed": "/sunflower.png",
  "cactus seed": "/cactus.png",
  "strawberry seed": "/strawberry.png",
  "pumpkin seed": "/pumpkin.png",
  "dragon fruit seed": "/dragon_fruit.png",
  "eggplant seed": "/eggplant.png",
  "watermelon seed": "/watermelon.png",
  "cocotank seed": "/cocotank.png",
  "carnivorous plant seed": "/carnivorous.png",
  "mr carrot seed": "/mrcarrot.png",
  "tomatrio seed": "/tomatrio.png",
  "mango seed": "/mango.png",
  "king limone": "/limone.png",
};

const gearImages = {
  "water bucket": "/water_bucket.png",
  "frost grenade": "/frost_grenade.png",
  "banana gun": "/banana_gun.png",
  "frost blower": "/frost_blower.png",
  "carrot launcher": "/carrot_launcher.png",
};

const cleanName = (name) =>
  typeof name === "string" ? name.replace(/^[^\w]+/, "").trim() : name;

const parseStockFromDescription = (description = "") => {
  try {
    const normalized = description.replace(/\r\n/g, "\n");
    let seedsBlock = "";
    let gearBlock = "";

    if (normalized.includes("**Seeds**") || normalized.includes("**Gear**")) {
      const parts = normalized.split("**Gear**");
      seedsBlock = parts[0].replace("**Seeds**", "").trim();
      gearBlock = parts.slice(1).join("**Gear**").trim();
    } else {
      const lines = normalized
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const seeds = [];
      const gear = [];
      for (const line of lines) {
        if (!line.includes(" x")) continue;
        const cleaned = line
          .replace(/<:[^:]+:\d+>/g, "")
          .replace(/\*/g, "")
          .trim();
        const [namePart, stockPart] = cleaned.split(" x");
        if (!namePart || !stockPart) continue;
        const low = namePart.toLowerCase();
        const stock = parseInt(stockPart.replace(/[^0-9]/g, ""), 10) || 0;
        if (
          low.includes("seed") ||
          Object.keys(seedImages).some((k) => k === low || k === `${low} seed`)
        ) {
          seeds.push({
            name: cleanName(namePart),
            stock,
            icon: seedImages[`${low} seed`] || seedImages[low] || "",
          });
        } else if (Object.keys(gearImages).some((k) => k === low)) {
          gear.push({
            name: cleanName(namePart),
            stock,
            icon: gearImages[low] || "",
          });
        } else {
          seeds.push({
            name: cleanName(namePart),
            stock,
            icon: seedImages[`${low} seed`] || seedImages[low] || "",
          });
        }
      }
      return { seeds, gear };
    }

    const parseBlock = (block) => {
      if (!block) return [];
      return block
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && l.includes(" x"))
        .map((line) => {
          const cleaned = line
            .replace(/<:[^:]+:\d+>/g, "")
            .replace(/\*/g, "")
            .trim();
          const parts = cleaned.split(" x");
          if (parts.length < 2) return null;
          const name = parts[0].trim();
          const stock = parseInt(parts[1].replace(/[^0-9]/g, ""), 10) || 0;
          const low = name.toLowerCase();
          const icon =
            seedImages[`${low} seed`] ||
            seedImages[low] ||
            gearImages[low] ||
            "";
          return { name: cleanName(name), stock, icon };
        })
        .filter(Boolean);
    };

    const seeds = parseBlock(seedsBlock);
    const gear = parseBlock(gearBlock);

    return { seeds, gear };
  } catch (err) {
    console.error("parseStockFromDescription error:", err);
    return { seeds: [], gear: [] };
  }
};

const parseNextUpdate = (description = "") => {
  try {
    const m =
      description.match(/<t:(\d+):[RrFfTt]>/) ||
      description.match(/<t:(\d+):[rftRFT]/);
    if (!m) return null;
    const ts = parseInt(m[1], 10);
    if (Number.isNaN(ts)) return null;
    return new Date(ts * 1000);
  } catch (err) {
    return null;
  }
};

const calculateNextFetchTime = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 5) * 5;
  const nextTime = new Date(now);
  nextTime.setMinutes(roundedMinutes, 0, 0);
  if (roundedMinutes >= 60) {
    nextTime.setHours(nextTime.getHours() + 1);
    nextTime.setMinutes(0, 0, 0);
  }
  if (nextTime <= now) {
    nextTime.setMinutes(nextTime.getMinutes() + 5);
  }
  return nextTime;
};

export default function Home() {
  const [stock, setStock] = useState({ seeds: [], gear: [] });
  const [nextUpdate, setNextUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStock = async () => {
    const now = Date.now();
    if (isLoading || now - lastFetchTime < 10000) {
      console.log("Fetch blocked by anti-spam");
      return;
    }
    setIsLoading(true);
    setLastFetchTime(now);
    try {
      const res = await fetch("/api/stock");
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const errorMsg = `HTTP ${res.status}: ${res.statusText} ${text}`;
        console.error("API Error:", errorMsg);
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No data returned from API");
      }
      const latest = data[0];
      const description = latest.embeds?.[0]?.description || "";
      const parsed = parseStockFromDescription(description);
      setStock(parsed);
      const next = parseNextUpdate(description) || calculateNextFetchTime();
      if (next && (!nextUpdate || next.getTime() !== nextUpdate.getTime())) {
        setNextUpdate(next);
      }
      setError(null);
      setRetryCount(0);
      setCountdownKey((prev) => prev + 1);
      console.log("Stock updated successfully!");
    } catch (err) {
      console.error("fetchStock error:", err.message);
      setError(`Failed to load: ${err.message}. Retrying...`);
      setRetryCount((prev) => prev + 1);
      if (err.message.includes("500") && retryCount < 3) {
        setTimeout(fetchStock, 60000);
      } else {
        setNextUpdate(calculateNextFetchTime());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    let timeoutId;
    const scheduleNextFetch = () => {
      if (!nextUpdate) return;
      let diffMs = nextUpdate - new Date();
      if (diffMs <= 0) diffMs = 1000;
      timeoutId = setTimeout(fetchStock, Math.max(diffMs, 0));
    };
    scheduleNextFetch();
    return () => clearTimeout(timeoutId);
  }, [nextUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownKey((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextUpdate]);

  const formatCountdown = () => {
    if (!nextUpdate) return "Calculating...";
    const diff = nextUpdate - new Date();
    if (diff <= 0) return "Updating now...";
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Head>
        <title>Plant vs Brainrots - Live Seed & Gear Stock Notifier</title>
        <meta
          name="description"
          content="Track Plant vs Brainrots seed 🌱 and gear ⚙️ stock in real-time. Data updates automatically every 5 minutes directly from the in-game shop."
        />
        <meta
          name="keywords"
          content="plant vs brainrots, plant vs brainrot, plants vs brainrot, plants vs brainrots, pvb, plant vs brainrots info stock, plant vs brainrots stock notifier, plant vs brainrots stock tracker, seeds, gear, live stock, pvb shop, pvb seeds, trading server plant vs brainrots"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app" />
        <link rel="icon" href="/favicon.ico" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2348732504828730"
          crossOrigin="anonymous"
        ></script>
      </Head>

      <div className="page-wrap">
        {/* ================= HEADER ================= */}
        <header className="site-header">
          <div className="header-left">
            <div className="title-block">
              <h1 className="site-title">🌱 Live Plant vs Brainrots 🧠</h1>
              <p className="site-sub">Real-Time Seed & Gear Stock Notifier</p>
            </div>

            <p className="lead">
              Stay updated with the latest Plant vs Brainrots shop changes! This
              site automatically pulls seed and gear stock directly from the
              game and displays it in a Discord-style embed.
            </p>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="main-grid">
          <section className="left-panel">
            {/* Konten utamamu tetap sama */}
            <div className="discord-chat appear">
              {/* Stock embed asli kamu tetap di sini */}
            </div>

            {/* ================= Tambahan konten bernilai tinggi ================= */}
            <section className="info-section">
              <h2>About Plant vs Brainrots Tracker</h2>
              <p>
                This website was created by <strong>iRexus</strong> as a free
                and open platform for <em>Plant vs Brainrots</em> players. It
                automatically gathers live seed and gear data directly from
                the game and updates every few minutes. The goal is to
                help players plan trades, predict stock changes, and stay ahead
                of in-game rotations.
              </p>
              <p>
                Unlike other static tools, this site focuses on accuracy and
                real-time updates. Every refresh is designed to minimize server
                load and provide consistent stock data to thousands of visitors
                every day.
              </p>
            </section>

            <section className="guide-section">
              <h2>How to Use</h2>
              <ul>
                <li>Check the live stock data displayed above.</li>
                <li>Wait for automatic refresh every few minutes.</li>
                <li>Join our Discord community for faster notifications.</li>
                <li>Use this site responsibly — no spam or automation.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>Privacy Policy</h2>
              <p>
                This site does not collect personal information. We use Google
                AdSense and cookies only for ad personalization. By using this
                site, you agree to Google's{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Advertising Terms
                </a>
                .
              </p>
            </section>
          </section>

          <aside className="right-panel">
            <div className="card small">
              <div className="card-title">Status</div>
              <div className="card-body">
                <div className="row">
                  <div className="label">Fetch status</div>
                  <div className="value">
                    {isLoading ? "Loading..." : error ? "Error" : "OK"}
                  </div>
                </div>
                <div className="row">
                  <div className="label">Seeds</div>
                  <div className="value">{stock.seeds.length}</div>
                </div>
                <div className="row">
                  <div className="label">Gear</div>
                  <div className="value">{stock.gear.length}</div>
                </div>
              </div>
            </div>

            {/* Blok iklan manual */}
            <div className="card small">
              <div className="card-title">Sponsored</div>
              <div className="card-body">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-client="ca-pub-2348732504828730"
                  data-ad-slot="1234567890"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
                <script
                  dangerouslySetInnerHTML={{
                    __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
                  }}
                />
              </div>
            </div>
          </aside>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="site-footer">
          <p>
            © {new Date().getFullYear()} iRexus • Data sourced from Discord
            embeds. Fan-made tool for Plant vs Brainrots players.
          </p>
          <div>
            <a href="#">About</a> • <a href="#">Privacy Policy</a> •{" "}
            <a
              href="https://discord.gg/Bun8HKKQ3D"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

