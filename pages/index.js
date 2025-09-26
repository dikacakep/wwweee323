import { useEffect, useState } from "react";
import Image from "next/image";

const seedImages = {
  'sunflower seed': '/sunflower.png',
  'cactus seed': '/cactus.png',
  'strawberry seed': '/strawberry.png',
  'pumpkin seed': '/pumpkin.png',
  'dragon fruit seed': '/dragon_fruit.png',
  'eggplant seed': '/eggplant.png',
  'watermelon seed': '/watermelon.png',
  'cocotank seed': '/cocotank.png',
  'carnivorous plant seed': '/carnivorous.png',
  'mr carrot seed': '/mrcarrot.png',
  'tomatrio seed': '/tomatrio.png',
};

const gearImages = {
  'water bucket': '/water_bucket.png',
  'frost grenade': '/frost_grenade.png',
  'banana gun': '/banana_gun.png',
  'frost blower': '/frost_blower.png',
  'carrot launcher': '/carrot_launcher.png',
};

export default function Home() {
  const [stockData, setStockData] = useState({ seeds: [], gear: [] });
  const [nextUpdate, setNextUpdate] = useState(null);

  const cleanName = (name) => {
    return name
      .replace(/^[^\w]+/, "") // hilangkan emoji
      .trim()
      .toLowerCase();
  };

  const fetchStockData = async () => {
    try {
      const res = await fetch("/api/stock");
      const data = await res.json();

      const seeds =
        data?.seedgear?.seeds?.map((item) => {
          const clean = cleanName(item.name);
          return {
            name: item.name.replace(/^[^\w]+/, "").trim(),
            icon: seedImages[clean] || "",
            stock: parseInt(item.value.replace("x", ""), 10),
          };
        }) || [];

      const gear =
        data?.seedgear?.gear?.map((item) => {
          const clean = cleanName(item.name);
          return {
            name: item.name.replace(/^[^\w]+/, "").trim(),
            icon: gearImages[clean] || "",
            stock: parseInt(item.value.replace("x", ""), 10),
          };
        }) || [];

      setStockData({ seeds, gear });

      const updatedAt = new Date(data?.seedgear?.updatedAt);
      const next = new Date(updatedAt);
      next.setMinutes(next.getMinutes() + 5);
      setNextUpdate(next);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(() => {
      const now = new Date();
      if (nextUpdate && now >= nextUpdate) {
        fetchStockData();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextUpdate]);

  const formatCountdown = () => {
    if (!nextUpdate) return "Menghitung...";
    const now = new Date();
    const diff = nextUpdate - now;
    if (diff <= 0) return "Memperbarui...";
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
    <div className="container">
      <header>
        <h1>🌱 Live Plant vs Brainrots 🧠</h1>
        <p className="subtitle">Live Plant vs Brainrots Stocks</p>
        <p className="description">
          The stock data is automatically pulled from the in-game shops when
          it&apos;s time to change, ensuring the most accurate stocks all the
          time. Seed and gear stocks update every 5 minutes.
        </p>
        <div className="join-buttons">
          {/* ✅ Ganti # dengan link Discord kamu */}
          <a
            href="https://discord.gg/xxxxxx"
            className="join-btn discord-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="btn-icon">💬</span>
            <span className="btn-text">Join Discord Server</span>
            <span className="btn-desc">
              🤖 Discord Server and Bot info stock
            </span>
          </a>

          {/* ✅ Ganti # dengan link WhatsApp kamu */}
          <a
            href="https://chat.whatsapp.com/xxxxxx"
            className="join-btn whatsapp-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="btn-icon">📱</span>
            <span className="btn-text">Join WhatsApp</span>
            <span className="btn-desc">📢 Plant vs Brainrots Stock</span>
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
  );
}
