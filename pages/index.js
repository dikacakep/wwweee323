import { useEffect, useState, useRef } from "react";
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
  "shroombino seed": "/shroombino.png",
  "grape seed": "grapeseed.png",
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [isRestocking, setIsRestocking] = useState(false);
  const prevDataRef = useRef(null);
  const isWaitingRef = useRef(false);

  const cleanName = (name) => name.replace(/^[^\w]+/, "").trim().toLowerCase();

  const isDataChanged = (oldData, newData) => {
    if (!oldData) return true;
    return JSON.stringify(oldData) !== JSON.stringify(newData);
  };

  // Fungsi untuk menghitung kelipatan 5 menit berikutnya
  const getNextFiveMinuteMark = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const minutesToNext = 5 - (minutes % 5) || 5;
    const secondsToNext = minutesToNext * 60 - seconds;
    const msToNext = secondsToNext * 1000 - milliseconds;

    const next = new Date(now.getTime() + msToNext);
    console.log(`⏰ Next update scheduled at: ${next.toLocaleTimeString()}`);
    return next;
  };

  const fetchStockData = async (isManualCheck = false) => {
    try {
      console.log(isManualCheck ? "⏳ Checking for new stock..." : "⏳ Fetching stock data...");
      const res = await fetch("/api/stock", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ""}`,
        },
      });
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      console.log("📡 API response:", data);

      const seeds =
        data?.seeds?.map((item) => {
          const clean = cleanName(item.name);
          return {
            name: item.name.replace(/^[^\w]+/, "").trim(),
            icon: seedImages[clean] || "",
            stock: item.stock,
          };
        }) || [];

      const gear =
        data?.gears?.map((item) => {
          const clean = cleanName(item.name);
          return {
            name: item.name.replace(/^[^\w]+/, "").trim(),
            icon: gearImages[clean] || "",
            stock: item.stock,
          };
        }) || [];

      const newData = { seeds, gear };
      console.log("📦 Processed stock data:", newData);

      if (isDataChanged(prevDataRef.current, newData) || !isManualCheck) {
        setStockData(newData);
        setError(null);
        console.log("✅ Stock updated");
      } else {
        console.log("ℹ️ No new stock");
      }

      prevDataRef.current = newData;
      const hasNewStock = res.headers.get("X-Stock-Updated") === "true" || data?.hasNewStock;
      return hasNewStock;
    } catch (err) {
      console.error("❌ Failed to fetch stock data:", err.message);
      setError(`Failed to load stock data: ${err.message}. Retrying soon...`);
      return false;
    }
  };

  useEffect(() => {
    // Inisialisasi nextUpdate
    setNextUpdate(getNextFiveMinuteMark());
    fetchStockData(); // Fetch pertama kali

    // Interval untuk timer dan fetch
    const interval = setInterval(async () => {
      const now = new Date();
      setCurrentTime(now); // Perbarui waktu untuk timer

      if (isWaitingRef.current) {
        return; // Sedang menunggu 10 detik
      }

      // Cek stok baru setiap 30 detik
      if (!isRestocking && now.getSeconds() % 30 === 0) {
        const hasNewStock = await fetchStockData(true);
        if (hasNewStock) {
          console.log("🔄 New stock detected, forcing full fetch");
          setNextUpdate(getNextFiveMinuteMark());
          fetchStockData(false);
          return;
        }
      }

      // Fetch saat kelipatan 5 menit
      if (nextUpdate && now >= nextUpdate) {
        console.log("🔄 Time for scheduled fetch");
        setIsRestocking(true);
        fetchStockData(false);

        isWaitingRef.current = true;
        setTimeout(() => {
          setNextUpdate(getNextFiveMinuteMark());
          setIsRestocking(false);
          isWaitingRef.current = false;
          console.log("🔄 Timer reset after 10-second delay");
        }, 10 * 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextUpdate]);

  const formatCountdown = () => {
    if (!nextUpdate) return "Calculating...";
    if (isRestocking) return "Restocking...";

    const diff = nextUpdate - currentTime;
    if (diff <= 0) return "Restocking...";

    const totalSeconds = Math.floor(diff / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

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

        {error && <div className="error-message" style={{ color: "red", margin: "10px 0" }}>{error}</div>}

        <div className="last-update">
          ⏱️ Next update in: <strong>{formatCountdown()}</strong>
        </div>

        <div className="stats-grid">
          <div className="category-card">
            <div className="category-header">
              <div className="category-icon">🌱</div>
              <div className="category-title">Seeds</div>
            </div>
            <div className="item-list">
              {stockData.seeds.length > 0 ? (
                stockData.seeds.map(createItem)
              ) : (
                <p>Loading</p>
              )}
            </div>
          </div>

          <div className="category-card">
            <div className="category-header">
              <div className="category-icon">⚙️</div>
              <div className="category-title">Gear</div>
            </div>
            <div className="item-list">
              {stockData.gear.length > 0 ? (
                stockData.gear.map(createItem)
              ) : (
                <p>Loading</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
