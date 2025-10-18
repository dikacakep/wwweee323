// pages/index.js
import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";

// --- Konfigurasi gambar ---
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

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <Head>
        <title>Plant vs Brainrots - Live Tracker, Guide & Community Hub</title>
        <meta
          name="description"
          content="Complete Plant vs Brainrots resource: live shop stock, wiki, rarity guide, mutation system, active codes, fusion recipes, and trading tips. Updated in real-time for Roblox players."
        />
        <meta
          name="keywords"
          content="plant vs brainrots, plant vs brainrots guide, Plant vs brainrots wiki, plant vs brainrot, plants vs brainrot, plants vs brainrots, pvb, plant vs brainrots info stock, plant vs brainrots stock notifier, plant vs brainrots stock tracker, seeds, gear, plant vs brainrots live stock, pvb shop, pvb seeds, trading server plant vs brainrots"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app/" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="page-wrap">
        {/* Navigation Header */}
        <header className="site-header">
          <div className="header-left">
            <div className="title-block">
              <h1 className="site-title">🌱 Plant vs Brainrots 🧠</h1>
              <p className="site-sub">The Ultimate Roblox PlantVSBrainrots Resource Hub</p>
            </div>

            <nav className="main-nav">
              <button onClick={() => scrollToSection("tracker")}>LIVE STOCK</button>
              <button onClick={() => scrollToSection("guide")}>GUIDE</button>
              <button onClick={() => scrollToSection("rarity")}>RARITY</button>
              <button onClick={() => scrollToSection("codes")}>CODES</button>
              <button onClick={() => scrollToSection("faq")}>FAQ</button>
              <button onClick={() => scrollToSection("about")}>ABOUT</button>
              <button onClick={() => scrollToSection("privacy")}>PRIVACY</button>
            </nav>

            <p className="lead">
              Your all-in-one destination for <strong>Plant vs Brainrots</strong> on Roblox. Track live shop stock, learn plant rarities, redeem active codes, and master mutations — all in one place.
            </p>

            <div className="join-buttons">
              <a
                href="https://discord.gg/Bun8HKKQ3D"
                className="join-btn discord-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="btn-icon">
                  <Image src="/discord.gif" alt="Discord" width={24} height={24} />
                </span>
                <span className="btn-text">Join Discord</span>
                <span className="btn-desc">🤖 Alerts & Trading</span>
              </a>

              <a
                href="https://chat.whatsapp.com/Im4P6NtHraMLmiILNQvcOE"
                className="join-btn whatsapp-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="btn-icon">
                  <Image src="/whatsapp.gif" alt="WhatsApp" width={24} height={24} />
                </span>
                <span className="btn-text">Join WhatsApp</span>
                <span className="btn-desc">📢 Real-time Notifier</span>
              </a>
            </div>
          </div>

          <div className="header-right">
            <a
              href="https://discord.com/oauth2/authorize?client_id=1383114211432988783"
              className="btn invite"
              target="_blank"
              rel="noopener noreferrer"
            >
              Invite Bot
            </a>
          </div>
        </header>

        <main className="main-grid">
          {/* LEFT PANEL - All Content */}
          <section className="left-panel">
            {/* === LIVE TRACKER === */}
            <section id="tracker" className="content-section">
              <h2>📊 Live Shop Stock Tracker</h2>
              <p>
                The in-game shop refreshes every <strong>5 minutes</strong>. Rare seeds like <em>Mr Carrot</em> or <em>King Limone</em> sell out in seconds. This tracker pulls data directly from the official Discord bot.
              </p>

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

                    <div className={`embed-card yellow-embed ${isLoading ? "loading" : ""}`}>
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
                            <div className="error-message">
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
                                <div className="empty-line">No seeds detected.</div>
                              ) : (
                                stock.seeds.map((s, idx) => (
                                  <div className="stock-item" key={`s-${idx}`}>
                                    {s.icon ? (
                                      <span className="stock-icon">
                                        <Image src={s.icon} alt={s.name} width={20} height={20} />
                                      </span>
                                    ) : (
                                      <span className="stock-emoji">🌱</span>
                                    )}
                                    <span className="stock-name">{s.name}</span>
                                    <span className="stock-quantity">x{s.stock}</span>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="stock-column">
                              <div className="stock-header">GEAR STOCK</div>
                              {stock.gear.length === 0 && !isLoading ? (
                                <div className="empty-line">No gear detected.</div>
                              ) : (
                                stock.gear.map((gItem, idx) => (
                                  <div className="stock-item" key={`g-${idx}`}>
                                    {gItem.icon ? (
                                      <span className="stock-icon">
                                        <Image src={gItem.icon} alt={gItem.name} width={20} height={20} />
                                      </span>
                                    ) : (
                                      <span className="stock-emoji">⚙️</span>
                                    )}
                                    <span className="stock-name">{gItem.name}</span>
                                    <span className="stock-quantity">x{gItem.stock}</span>
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
                            <span className="footer-note">Data pulled from Discord embeds</span>
                          </div>
                          <div className="footer-right">
                            <span className="next">
                              Next update in: <strong key={countdownKey}>{formatCountdown()}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* === GUIDE === */}
            <section id="guide" className="content-section">
              <h2>📖 Complete Beginner’s Guide</h2>
              <p>
                <em>Plant vs Brainrots</em> is a strategic farming and PvP game on Roblox where you grow plants, collect rare seeds, and battle other players using unique gear.
              </p>

              <h3>1. Understanding Seeds</h3>
              <p>
                Seeds are the core of the game. Each seed grows into a plant that produces resources or has special combat abilities. Common seeds include Sunflower and Strawberry, while rare ones like Dragon Fruit and Carnivorous Plant can give you a huge advantage.
              </p>
              <p><strong>Tip:</strong> Always check the shop every 5 minutes—rare seeds sell out fast!</p>

              <h3>2. Using Gear Effectively</h3>
              <p>
                Gear like the Banana Gun, Frost Blower, and Carrot Launcher can destroy enemy farms or protect yours. Water Bucket heals your plants, while Frost Grenade slows attackers.
              </p>
              <p>Combine gear strategically: use Frost Blower to freeze enemies, then attack with Carrot Launcher!</p>

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
            </section>

            {/* === RARITY & PRICING === */}
            <section id="rarity" className="content-section">
              <h2>💎 Plant Rarity & Pricing Guide</h2>
              <p>
                Plants in PvB are categorized by rarity, which affects their price, damage, and prestige. Below is the official pricing (in-game Cash) as of October 2025.
              </p>

              <table className="rarity-table">
                <thead>
                  <tr>
                    <th>Plant</th>
                    <th>Rarity</th>
                    <th>Price (Cash)</th>
                    <th>Base DMG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Cactus</td><td>Rare</td><td>$200</td><td>10</td></tr>
                  <tr><td>Strawberry</td><td>Rare</td><td>$1,250</td><td>25</td></tr>
                  <tr><td>Pumpkin</td><td>Epic</td><td>$5,000</td><td>55</td></tr>
                  <tr><td>Sunflower</td><td>Epic</td><td>$25,000</td><td>115</td></tr>
                  <tr><td>Dragon Fruit</td><td>Legendary</td><td>$100,000</td><td>250</td></tr>
                  <tr><td>Eggplant</td><td>Legendary</td><td>$250,000</td><td>500</td></tr>
                  <tr><td>Watermelon</td><td>Mythic</td><td>$1,000,000</td><td>750</td></tr>
                  <tr><td>Grape</td><td>Mythic</td><td>$2,500,000</td><td>1,500</td></tr>
                  <tr><td>Cocotank</td><td>Godly</td><td>$5,000,000</td><td>2,000</td></tr>
                  <tr><td>Carnivorous Plant</td><td>Godly</td><td>$25,000,000</td><td>2,500</td></tr>
                  <tr><td>Mr. Carrot</td><td>Secret</td><td>$50,000,000</td><td>3,500</td></tr>
                  <tr><td>Tomatrio</td><td>Secret</td><td>$125,000,000</td><td>9,000</td></tr>
                  <tr><td>Shroombino</td><td>Secret</td><td>$200,000,000</td><td>12,500</td></tr>
                  <tr><td>Mango</td><td>Secret</td><td>$367,000,000</td><td>7,500</td></tr>
                  <tr><td>King Limone</td><td>Secret</td><td>$670,000,000</td><td>12,500</td></tr>
                </tbody>
              </table>

              <h3>Mutations & Weather Events</h3>
              <p>
                Mutations enhance your plants. Common types: <strong>Gold (×2)</strong>, <strong>Diamond (×3)</strong>, <strong>Frozen (×4)</strong>, <strong>Neon (×4.5)</strong>, <strong>Rainbow (×6)</strong>, and <strong>Galactic (×8)</strong>.
              </p>
              <p>
                These appear during special weather events like <em>Frozen Blizzard</em>, <em>Prismatic Surge</em>, or <em>Cosmic Bloom</em>.
              </p>
            </section>

            {/* === ACTIVE CODES === */}
            <section id="codes" className="content-section">
              <h2>🎁 Active Redeem Codes (October 2025)</h2>
              <p>Redeem these codes in-game for free rewards before they expire!</p>

              <table className="codes-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Reward</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>STACKS</td><td>1x Lucky Potion</td><td>✅ Active</td></tr>
                  <tr><td>frozen</td><td>1x Frost Grenade</td><td>✅ Active</td></tr>
                  <tr><td>based</td><td>$5,000 Cash</td><td>✅ Active</td></tr>
                </tbody>
              </table>

              <h3>How to Redeem</h3>
              <ol>
                <li>Open the game on Roblox.</li>
                <li>Complete the tutorial (required).</li>
                <li>Go to <strong>Shop → Codes / Redeem tab</strong>.</li>
                <li>Enter the code and press <strong>Claim</strong>.</li>
              </ol>
              <p><strong>Note:</strong> Codes expire without notice. Redeem ASAP!</p>
            </section>

            {/* === FAQ === */}
            <section id="faq" className="content-section">
              <h2>❓ Frequently Asked Questions</h2>

              <div className="faq-item">
                <h3>How often does the shop refresh?</h3>
                <p>Every 5 minutes. Our tracker updates automatically at each refresh.</p>
              </div>

              <div className="faq-item">
                <h3>Is this site affiliated with Roblox or the game developers?</h3>
                <p>No. We are a fan-made community resource, not affiliated with Roblox Corporation or the PvB developers.</p>
              </div>

              <div className="faq-item">
                <h3>Do you collect my personal data?</h3>
                <p>No. We do not collect, store, or process any personal information. See our Privacy Policy below.</p>
              </div>

              <div className="faq-item">
                <h3>Why is my favorite seed not showing?</h3>
                <p>The shop stock is random. If it’s not listed, it’s not currently available. Check back in 5 minutes!</p>
              </div>

              <div className="faq-item">
                <h3>Can I buy plants with Robux?</h3>
                <p>Plants are purchased with in-game Cash, not Robux. However, some cosmetics or boosts may use Robux.</p>
              </div>
            </section>

            {/* === ABOUT === */}
            <section id="about" className="content-section">
              <h2>ℹ️ About This Site</h2>
              <p>
                This live stock tracker was created to help players of <em>Plant vs Brainrots</em> monitor real-time availability of seeds and gear in the in-game shop.
              </p>
              <p>
                The shop refreshes every 5 minutes with random stock, and rare items often sell out in seconds. Our system pulls data directly from the official Discord bot to give you accurate, up-to-the-second information.
              </p>
              <h3>Why We Built This</h3>
              <p>
                As active players, we noticed many missed opportunities due to lack of real-time data. This tool ensures no player misses a chance to grab a <strong>King Limone</strong> or <strong>Mango</strong> again.
              </p>
              <h3>Open & Transparent</h3>
              <p>
                We do not modify or cache data—we display exactly what the bot posts. All data is sourced from public Discord embeds.
              </p>
              <p>Made with ❤️ by iRexus. Not affiliated with Roblox Corporation.</p>
            </section>

            {/* === PRIVACY POLICY === */}
            <section id="privacy" className="content-section">
              <h2>🔒 Privacy Policy</h2>
              <p><em>Last updated: October 17, 2025</em></p>

              <h3>1. No Personal Data Collected</h3>
              <p>Our website does NOT collect, store, or process any personal information from visitors. We do not use cookies for tracking.</p>

              <h3>2. Data Source</h3>
              <p>All displayed data (seed and gear stock) is pulled from public Discord bot messages. This data is not associated with any individual user.</p>

              <h3>3. Third-Party Services</h3>
              <p>We may use third-party advertising services in the future. If implemented, such services may use cookies.</p>

              <h3>4. Changes to This Policy</h3>
              <p>We may update this policy. The updated version will be posted here with a new "Last updated" date.</p>

              <h3>5. Contact Us</h3>
              <p>Questions? Join our <a href="https://discord.gg/Bun8HKKQ3D" target="_blank" rel="noopener">Discord server</a>.</p>
            </section>
          </section>

          {/* RIGHT PANEL - Status & Actions */}
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
            © {new Date().getFullYear()} iRexus • 
            <a href="#privacy" onClick={(e) => { e.preventDefault(); scrollToSection("privacy"); }}> Privacy Policy</a> • 
            Data from Discord
          </span>
        </footer>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .main-nav {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin: 16px 0;
        }
        .main-nav button {
          background: none;
          border: none;
          color: var(--yellow);
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .main-nav button:hover {
          background: rgba(254, 231, 92, 0.1);
        }
        .content-section {
          margin-bottom: 32px;
          padding: 20px;
          background: var(--panel);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .content-section h2 {
          color: var(--yellow);
          margin-bottom: 16px;
          font-size: 1.8rem;
        }
        .content-section h3 {
          color: #fff;
          margin: 20px 0 12px;
          font-size: 1.3rem;
        }
        .content-section p, .content-section li {
          margin-bottom: 12px;
          line-height: 1.6;
        }
        .content-section a {
          color: var(--accent);
          text-decoration: underline;
        }
        .content-section ul, .content-section ol {
          padding-left: 20px;
          margin: 12px 0;
        }
        .faq-item {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .faq-item h3 {
          margin-bottom: 8px;
        }
        .rarity-table, .codes-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          overflow: hidden;
        }
        .rarity-table th, .rarity-table td,
        .codes-table th, .codes-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .rarity-table th, .codes-table th {
          background: rgba(254, 231, 92, 0.1);
          color: var(--yellow);
        }
        .ad-placeholder {
          background: var(--panel);
          border-radius: 8px;
          padding: 12px;
          border: 1px solid rgba(0, 0, 0, 0.45);
          text-align: center;
        }
        /* Existing styles from globals.css remain applicable */
      `}</style>
    </>
  );
}
