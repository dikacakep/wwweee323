import { useEffect, useState } from 'react';
import Image from 'next/image';

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

// 🧼 Fungsi bantu: hapus emoji dan spasi aneh
const cleanName = (str) => {
  return str
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // hapus emoji
    .replace(/\s+/g, ' ') // ubah banyak spasi jadi 1
    .trim()
    .toLowerCase();
};

export default function Home() {
  const [stockData, setStockData] = useState({ seeds: [], gear: [] });
  const [nextUpdate, setNextUpdate] = useState(null);

  const fetchStockData = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();

      console.log('📦 Data dari API:', data);

      const seeds = data.seedgear?.seeds?.map(item => {
        const key = cleanName(item.name); // 🧼 bersihkan emoji
        return {
          name: item.name.replace(/^[^\w]+/, ''), // hilangkan emoji di tampilan
          icon: seedImages[key] || '/default.png', // ambil gambar
          stock: parseInt(item.value.replace('x', ''), 10),
        };
      }) || [];

      const gear = data.seedgear?.gear?.map(item => {
        const key = cleanName(item.name);
        return {
          name: item.name.replace(/^[^\w]+/, ''),
          icon: gearImages[key] || '/default.png',
          stock: parseInt(item.value.replace('x', ''), 10),
        };
      }) || [];

      setStockData({ seeds, gear });

      const updatedAt = new Date(data.seedgear.updatedAt);
      const next = new Date(updatedAt);
      next.setMinutes(next.getMinutes() + 5);
      setNextUpdate(next);
    } catch (error) {
      console.error('Gagal memuat data:', error);
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

  const createItemElement = (item) => (
    <div className="item" key={item.name}>
      <div className="item-info" style={{ display: 'flex', alignItems: 'center' }}>
        <Image 
          src={item.icon} 
          alt={item.name} 
          width={32} 
          height={32} 
          style={{ marginRight: 12, objectFit: 'contain' }} 
        />
        <div className="item-name">{item.name}</div>
      </div>
      <div className="item-stock">
        <div className="stock-number">{item.stock}</div>
        <div className="stock-status out-stock">RESTOCK</div>
      </div>
    </div>
  );

  const formatCountdown = () => {
    if (!nextUpdate) return 'Menghitung...';
    const now = new Date();
    const diff = nextUpdate - now;
    if (diff <= 0) return 'Memperbarui...';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <header>
        <h1>🌱 Plant vs Zombies 🧠</h1>
        <p className="subtitle">Real-Time Stock Tracker</p>
      </header>

      <div className="last-update">
        ⏰ Update berikutnya: <strong>{formatCountdown()}</strong>
      </div>

      <div className="stats-grid">
        <div className="category-card">
          <div className="category-header">
            <div className="category-icon">🌱</div>
            <div className="category-title">Seeds</div>
          </div>
          <div className="item-list">
            {stockData.seeds?.map(createItemElement)}
          </div>
        </div>

        <div className="category-card">
          <div className="category-header">
            <div className="category-icon">⚙️</div>
            <div className="category-title">Gear</div>
          </div>
          <div className="item-list">
            {stockData.gear?.map(createItemElement)}
          </div>
        </div>
      </div>
    </div>
  );
}
