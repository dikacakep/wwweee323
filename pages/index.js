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
  const prevDataRef = useRef(null);

  const cleanName = (name) => name.replace(/^[^\w]+/, "").trim().toLowerCase();

  const isDataChanged = (oldData, newData) => {
    if (!oldData) return true;
    return JSON.stringify(oldData) !== JSON.stringify(newData);
  };

  const fetchStockData = async () => {
    try {
      const res = await fetch("/api/stock", {
        headers: {
          "Authorization": `Bearer ${process.env.API_TOKEN}`,
        },
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();

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

      // ❗ Reset timer setiap kali fetch, walaupun data tidak berubah
      setNextUpdate(new Date(Date.now() + 5 * 60 * 1000));

      // Simpan data baru
      setStockData(newData);

      // Cek perubahan (optional: log)
      if (isDataChanged(prevDataRef.current, newData)) {
        console.log("✅ Stock updated");
      } else {
        console.log("ℹ️ Stock same as before, but timer reset anyway");
      }

      prevDataRef.current = newData;
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
      // tetap reset timer walaupun gagal agar retry terus
      setNextUpdate(new Date(Date.now() + 5 * 60 * 1000));
    }
  };

  useEffect(() => {
    // Fetch pertama kali
    fetchStockData();

    // Interval untuk cek countdown & fetch ulang jika waktunya habis
    const interval = setInterval(() => {
      const now = new Date();
      if (nextUpdate && now >= nextUpdate) {
        fetchStockData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextUpdate]);

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
