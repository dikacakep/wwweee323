"use client";
import { useEffect, useState, useRef } from "react";

export default function StockPage() {
  const [stockData, setStockData] = useState({ seeds: [], gear: [] });
  const [nextUpdate, setNextUpdate] = useState(null);
  const prevDataRef = useRef(null);

  // 🔍 Fungsi cek perubahan data
  const isDataChanged = (oldData, newData) => {
    return JSON.stringify(oldData) !== JSON.stringify(newData);
  };

  // 🧠 Ambil data dari API
  const fetchStockData = async () => {
    try {
      const res = await fetch("/api/stock", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      const newData = {
        seeds: data?.seeds || [],
        gear: data?.gears || [],
      };

      // ✅ Reset timer hanya jika data berubah atau pertama kali
      if (isDataChanged(prevDataRef.current, newData) || !nextUpdate) {
        console.log("✅ Data berubah / pertama kali → reset timer");
        setNextUpdate(new Date(Date.now() + 5 * 60 * 1000)); // 5 menit
      } else {
        console.log("ℹ️ Data sama → timer tetap jalan");
      }

      prevDataRef.current = newData;
      setStockData(newData);
    } catch (err) {
      console.error("❌ Gagal fetch:", err);
      // Tetap reset supaya retry setelah 5 menit
      if (!nextUpdate) {
        setNextUpdate(new Date(Date.now() + 5 * 60 * 1000));
      }
    }
  };

  // 🕒 Panggil fetch pertama kali saat load
  useEffect(() => {
    fetchStockData();
  }, []);

  // 🔄 Interval cek setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      if (!nextUpdate) return;
      const now = new Date();

      // Timer habis → fetch ulang
      if (now >= nextUpdate) {
        fetchStockData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextUpdate]);

  // ⏱️ Hitung waktu tersisa
  const getRemainingTime = () => {
    if (!nextUpdate) return "Loading...";
    const diff = Math.max(0, nextUpdate - new Date());
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🌱 Stock Data</h1>
      <p>⏱️ Next update in: <strong>{getRemainingTime()}</strong></p>

      <h2>Seeds</h2>
      <ul>
        {stockData.seeds.map((item, i) => (
          <li key={i}>
            {item.name} - <strong>{item.stock}</strong>
          </li>
        ))}
      </ul>

      <h2>Gear</h2>
      <ul>
        {stockData.gear.map((item, i) => (
          <li key={i}>
            {item.name} - <strong>{item.stock}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
