// pages/index.js
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
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
  "king limone": "/limone.png"
};

const gearImages = {
  "water bucket": "/water_bucket.png",
  "frost grenade": "/frost_grenade.png",
  "banana gun": "/banana_gun.png",
  "frost blower": "/frost_blower.png",
  "carrot launcher": "/carrot_launcher.png"
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
  const [currentTime, setCurrentTime] = useState("");

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

  useEffect(() => {
    setCurrentTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }, []);

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
        <title>Plant vs Brainrots - Live Seed & Gear Stock Tracker</title>
        <meta
          name="description"
          content="Track Plant vs Brainrots seed 🌱 and gear ⚙️ stock in real-time. Data updates automatically every 5 minutes directly from the in-game shop."
        />
        <meta
          name="keywords"
          content="plant vs brainrots, plant vs brainrot, plants vs brainrot, plants vs brainrots, pvb, plant vs brainrots info stock, plant vs brainrots stock notifier, plant vs brainrots stock tracker, seeds, gear, plant vs brainrots live stock, pvb shop, pvb seeds, trading server plant vs brainrots"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="page-wrap">
        <header className="site-header">
          <div className="header-left">
            <div className="title-block">
              <h1 className="site-title">🌱 Live Plant vs Brainrots 🧠</h1>
              <p className="site-sub">Real-Time Seed & Gear Stock Notifier</p>
            </div>

            <nav className="main-nav">
              <Link href="/">Home</Link>
              <Link href="/guide">Guide</Link>
              <Link href="/about">About</Link>
              <Link href="/privacy-policy">Privacy</Link>
            </nav>

            <p className="lead">
              Stay updated with the latest Plant vs Brainrots shop changes! This
              site automatically pulls seed and gear stock directly from the game
              and displays it in a Discord-style embed. <strong>New to the game? Check out our beginner's guide!</strong>
            </p>

            <div className="join-buttons">
              <a
                href="https://discord.gg/Bun8HKKQ3D"
                className="join-btn discord-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="Join Discord Server"
              >
                <span className="btn-icon">
                  <Image
                    src="/discord.gif"
                    alt="Discord"
                    width={24}
                    height={24}
                  />
                </span>
                <span className="btn-text">Join Discord</span>
                <span className="btn-desc">
                  🤖 Stock alerts & trading community
                </span>
              </a>

              <a
                href="https://chat.whatsapp.com/Im4P6NtHraMLmiILNQvcOE"
                className="join-btn whatsapp-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="Join WhatsApp Group"
              >
                <span className="btn-icon">
                  <Image
                    src="/whatsapp.gif"
                    alt="WhatsApp"
                    width={24}
                    height={24}
                  />
                </span>
                <span className="btn-text">Join WhatsApp</span>
                <span className="btn-desc">
                  📢 Real-time Plant vs Brainrots notifier
                </span>
              </a>
            </div>
          </div>

          <div className="header-right">
            <a
              href="https://discord.com/oauth2/authorize?client_id=1383114211432988783"
              className="btn invite"
              target="_blank"
              rel="noopener noreferrer"
              title="Invite Bot"
            >
              Invite Bot
            </a>
          </div>
        </header>

        <main className="main-grid">
          <section className="left-panel">
            <div className="discord-chat appear">
              <article className="message bot">
                <div className="avatar-wrap">
                  <div className="avatar-badge-group">
                    <Image
                      src="/bot_avatar.jpeg"
                      alt="bot avatar"
                      width={48}
                      height={48}
                      className="avatar-img"
                    />
                  </div>
                </div>

                <div className="message-body">
                  <div className="meta-line">
                    <span className="username">
                      iRexus
                      <span className="verified-badge-inline">
                        <Image
                          src="/verified.png"
                          alt="Verified App"
                          width={32}
                          height={32}
                        />
                      </span>
                    </span>
                    <span className="msg-time">{currentTime || "Loading..."}</span>
                  </div>

                  <div
                    className={`embed-card yellow-embed ${isLoading ? "loading" : ""}`}
                  >
                    <div className="embed-leftbar" />
                    <div className="embed-content">
                      <div className="embed-title">
                        <Image
                          src="/chart.webp"
                          alt="Chart"
                          width={24}
                          height={24}
                          style={{ verticalAlign: "middle", marginRight: "6px" }}
                        />
                        Plant vs Brainrots - STOCK
                      </div>

                      <div className="embed-text">
                        {error && (
                          <div
                            className="error-message"
                            style={{
                              color: "#ed4245",
                              fontSize: "14px",
                              marginBottom: "12px",
                              padding: "8px",
                              background: "rgba(237, 66, 69, 0.1)",
                              borderRadius: "4px",
                            }}
                          >
                            {error}
                          </div>
                        )}
                        {isLoading && (
                          <div className="loading-indicator">
                            <span className="spinner"></span>
                            <span>Loading stock data...</span>
                          </div>
                        )}
                        <div className="stock-grid">
                          <div className="stock-column">
                            <div className="stock-header">SEEDS STOCK</div>
                            {stock.seeds.length === 0 && !isLoading ? (
                              <div className="empty-line">
                                No seeds detected.
                              </div>
                            ) : (
                              stock.seeds.map((s, idx) => (
                                <div className="stock-item" key={`s-${idx}`}>
                                  {s.icon ? (
                                    <span className="stock-icon">
                                      <Image
                                        src={s.icon}
                                        alt={s.name}
                                        width={20}
                                        height={20}
                                      />
                                    </span>
                                  ) : (
                                    <span className="stock-emoji">🌱</span>
                                  )}
                                  <span className="stock-name">{s.name}</span>
                                  <span className="stock-quantity">
                                    x{s.stock}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="stock-column">
                            <div className="stock-header">GEAR STOCK</div>
                            {stock.gear.length === 0 && !isLoading ? (
                              <div className="empty-line">
                                No gear detected.
                              </div>
                            ) : (
                              stock.gear.map((gItem, idx) => (
                                <div className="stock-item" key={`g-${idx}`}>
                                  {gItem.icon ? (
                                    <span className="stock-icon">
                                      <Image
                                        src={gItem.icon}
                                        alt={gItem.name}
                                        width={20}
                                        height={20}
                                      />
                                    </span>
                                  ) : (
                                    <span className="stock-emoji">⚙️</span>
                                  )}
                                  <span className="stock-name">
                                    {gItem.name}
                                  </span>
                                  <span className="stock-quantity">
                                    x{gItem.stock}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="progress-bar-container">
                          <div className="progress-bar"></div>
                        </div>
                      </div>

                      <div className="embed-footer">
                        <div className="footer-left">
                          <span className="footer-note">
                            Data pulled from Discord embeds
                          </span>
                        </div>

                        <div className="footer-right">
                          <span className="next">
                            Next update in:{" "}
                            <strong key={countdownKey}>
                              {formatCountdown()}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="static-content">
              <h2>About Plant vs Brainrots</h2>
              <p>
                <em>Plant vs Brainrots</em> is a popular Roblox game that combines farming, strategy, and PvP combat. Players collect seeds, grow plants, and use gear to defend against or attack other players' farms. The in-game shop refreshes every 5 minutes, offering limited stock of rare seeds and powerful gear.
              </p>
              <p>
                This live tracker helps players monitor shop availability so they never miss a chance to grab rare items like <strong>Dragon Fruit Seed</strong>, <strong>Carnivorous Plant Seed</strong>, or powerful tools like the <strong>Banana Gun</strong> and <strong>Frost Blower</strong>.
              </p>
              <p>
                For new players, understanding the economy and timing of shop refreshes is crucial. We recommend joining our Discord or WhatsApp groups for real-time alerts and trading opportunities.
              </p>
              <p>
                Unlike other trackers, our system pulls data directly from the official Discord bot embeds, ensuring 100% accuracy and zero delay. The site updates automatically—no manual refresh needed.
              </p>
              <p>
                Remember: stock is limited and sells out fast! Use this tool to plan your farming strategy and stay ahead of the competition.
              </p>
            </div>
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
                {retryCount > 0 && (
                  <div className="row">
                    <div className="label">Retries</div>
                    <div className="value">{retryCount}/3</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card small">
              <div className="card-title">Quick Actions</div>
              <div className="card-body actions">
                <button className="small-btn" onClick={() => fetchStock()}>
                  Refresh Now
                </button>
                <button
                  className="small-btn ghost"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </button>
              </div>
            </div>
          </aside>
        </main>

        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} iRexus •{" "}
            <Link href="/privacy-policy">Privacy Policy</Link> • Data from Discord
          </span>
        </footer>
      </div>

      <style jsx>{`
        .main-nav {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin: 16px 0;
          font-weight: 600;
        }
        .main-nav a {
          color: var(--yellow);
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .main-nav a:hover {
          background: rgba(254, 231, 92, 0.1);
        }
        .static-content {
          margin-top: 24px;
          padding: 16px;
          background: var(--panel);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          line-height: 1.6;
        }
        .static-content h2 {
          color: var(--yellow);
          margin-bottom: 12px;
          font-size: 1.4rem;
        }
        .static-content p {
          margin-bottom: 12px;
          color: #dcddde;
        }
      `}</style>
    </>
  );
}
