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
};

const gearImages = {
  "water bucket": "/water_bucket.png",
  "frost grenade": "/frost_grenade.png",
  "banana gun": "/banana_gun.png",
  "frost blower": "/frost_blower.png",
  "carrot launcher": "/carrot_launcher.png",
};

export default function Home() {
  const [stockData, setStockData] = useState({ seeds: [], gear: [] });
  const [nextUpdate, setNextUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false); // Prevent concurrent fetches

  const cleanName = (name) => {
    return name.replace(/^[^\w]+/, "").trim().toLowerCase();
  };

  const parseStockFromDescription = (description) => {
    try {
      const sections = description.split('**Gear**');
      if (sections.length < 2) {
        console.error('Invalid description format: Gear section not found');
        return { seeds: [], gear: [] };
      }

      const seedsText = sections[0].replace('**Seeds**', '').trim();
      const gearText = sections[1].split('\n\n')[0].trim();

      const seeds = seedsText
        .split('\n')
        .filter(line => line.trim() && line.includes(' x'))
        .map(line => {
          const [namePart, stockStr] = line.split(' x');
          if (!namePart || !stockStr) {
            console.warn(`Invalid seed line format: ${line}`);
            return null;
          }
          const name = namePart.trim();
          const stock = parseInt(stockStr.replace('x', '').trim(), 10) || 0;
          const clean = cleanName(name);
          const icon = seedImages[`${clean} seed`] || seedImages[clean] || "";
          return {
            name: name.replace(/^[^\w]+/, "").trim(),
            icon,
            stock,
          };
        })
        .filter(item => item !== null);

      const gear = gearText
        .split('\n')
        .filter(line => line.trim() && line.includes(' x'))
        .map(line => {
          const [namePart, stockStr] = line.split(' x');
          if (!namePart || !stockStr) {
            console.warn(`Invalid gear line format: ${line}`);
            return null;
          }
          const name = namePart.trim();
          const stock = parseInt(stockStr.replace('x', '').trim(), 10) || 0;
          const clean = cleanName(name);
          const icon = gearImages[clean] || "";
          return {
            name: name.replace(/^[^\w]+/, "").trim(),
            icon,
            stock,
          };
        })
        .filter(item => item !== null);

      return { seeds, gear };
    } catch (err) {
      console.error('Error parsing description:', err);
      return { seeds: [], gear: [] };
    }
  };

  const parseNextUpdate = (description) => {
    try {
      const timeLine = description.split('\n\n').pop();
      const match = timeLine.match(/<t:(\d+):R>/);
      if (!match) {
        console.error('No timestamp found in description');
        return null;
      }
      const timestamp = parseInt(match[1], 10);
      return new Date(timestamp * 1000);
    } catch (err) {
      console.error('Error parsing next update:', err);
      return null;
    }
  };

  const fetchStockData = async () => {
    if (isFetching) return; // Prevent concurrent fetches
    setIsFetching(true);
    try {
      const token = process.env.NEXT_PUBLIC_API_TOKEN;
      const res = await fetch("/api/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data format: Empty or not an array');
      }

      const latest = data[0];
      if (!latest.embeds || latest.embeds.length === 0) {
        throw new Error('No embeds in latest message');
      }

      const description = latest.embeds[0].description;
      const { seeds, gear } = parseStockFromDescription(description);
      setStockData({ seeds, gear });

      const next = parseNextUpdate(description);
      if (next) {
        setNextUpdate(next);
        setError(null);
      } else {
        setError('Failed to parse next update time');
        // Fallback to 5-minute interval if timestamp parsing fails
        setNextUpdate(new Date(Date.now() + 5 * 60 * 1000));
      }
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
      setError("Failed to load stock data. Please try again later.");
      // Fallback to 5-minute interval on error
      setNextUpdate(new Date(Date.now() + 5 * 60 * 1000));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchStockData(); // Initial fetch
    const interval = setInterval(() => {
      const now = new Date();
      if (nextUpdate && now >= nextUpdate && !isFetching) {
        fetchStockData();
      }
    }, 5000); // Check every 5 seconds instead of 1 second
    return () => clearInterval(interval);
  }, [nextUpdate, isFetching]);

  const formatCountdown = () => {
    if (!nextUpdate) return "Calculating...";
    const now = new Date();
    const diff = nextUpdate - now;
    if (diff <= 0) return "Updating...";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const createItem = (item) => (
    <div className="item" key={item.name}>
      <div className="item-info">
        {item.icon ? (
          <Image
            src={item.icon}
            alt={item.name}
            width={32}
            height={32}
            style={{ marginRight: 12 }}
          />
        ) : (
          <div style={{ width: 32, height: 32, marginRight: 12 }}></div>
        )}
        <div className="item-name">{item.name}</div>
      </div>
      <div className="item-stock">
        <div className="stock-number">{item.stock}</div>
        <div className="stock-status out-stock">RESTOCK</div>
      </div>
    </div>
  );

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
          content="plant vs brainrots, plant vs brainrot, plants vs brainrot, plants vs brainrots, pvb, plant vs brainrots info stock, plant vs brainrots stock notifier, stock tracker, seeds, gear, live stock, pvb shop, pvb seeds, trading server plant vs brainrots"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://plantvsbrainrots.vercel.app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header>
          <h1>🌱 Live Plant vs Brainrots 🧠</h1>
          <p className="subtitle">Real-Time Seed & Gear Stock Notifier</p>
          <p className="description">
            Stay updated with the latest Plant vs Brainrots shop changes! This
            site automatically pulls seed and gear stock directly from the game
            every 5 minutes — ensuring you never miss an item restock again.
          </p>
          <div className="join-buttons">
            <a
              href="https://discord.gg/Bun8HKKQ3D"
              className="join-btn discord-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-icon">💬</span>
              <span className="btn-text">Join Discord Server</span>
              <span className="btn-desc">🤖 Stock alerts & trading community</span>
            </a>
            <a
              href="https://chat.whatsapp.com/LMZ4Ulxr6LlEqeMMNMlTjD"
              className="join-btn whatsapp-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-icon">📱</span>
              <span className="btn-text">Join WhatsApp Group</span>
              <span className="btn-desc">📢 Real-time Plant vs Brainrots notifier</span>
            </a>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        <div className="last-update">
          ⏱️ Next update in: <strong>{formatCountdown()}</strong>
        </div>

        <div className="stats-grid">
          <div className="category-card">
            <div className="category-header">
              <div className="category-icon">🌱</div>
              <div className="category-title">Seeds</div>
            </div>
            <div className="item-list">{stockData.seeds.map(createItem)}</div>
          </div>

          <div className="category-card">
            <div className="category-header">
              <div className="category-icon">⚙️</div>
              <div className="category-title">Gear</div>
            </div>
            <div className="item-list">{stockData.gear.map(createItem)}</div>
          </div>
        </div>
      </div>
    </>
  );
}
