"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Vehicle,
  LEVELS,
  MAIN_COLOR,
  buildGrid,
  moveRange,
  applyMove,
  isSolved,
} from "@/lib/busGame";
import { sendMoveTx, connectWallet, isInMiniApp } from "@/lib/baseTx";
import {
  BoardGrid,
  LevelStats,
  BaseStatus,
  TxBanner,
  WinPanel,
} from "./BusParts";

type TxStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "success"; hash: string }
  | { state: "rejected" }
  | { state: "error" }
  | { state: "no-wallet" };

export default function BusJam() {
  const [level, setLevel] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>({ state: "idle" });
  const [inMiniApp, setInMiniApp] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [txPerMove, setTxPerMove] = useState(true);

  // Завантажити рівень
  const loadLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx];
    setVehicles(lvl.vehicles.map((v) => ({ ...v })));
    setSelected(null);
    setMoves(0);
    setWon(false);
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(`bus-best-${idx}`)
        : null;
    setBest(saved ? parseInt(saved, 10) : null);
  }, []);

  useEffect(() => {
    loadLevel(level);
  }, [level, loadLevel]);

  // Середовище Base
  useEffect(() => {
    (async () => {
      const inside = await isInMiniApp();
      setInMiniApp(inside);
      if (inside) setWallet(await connectWallet());
    })();
  }, []);

  // Зсунути вибраний транспорт у клітинку (r,c), якщо це валідно вздовж його осі
  const tryMoveTo = useCallback(
    (id: string, r: number, c: number) => {
      if (won) return;
      const v = vehicles.find((x) => x.id === id);
      if (!v) return;

      // Обчислити бажаний delta вздовж осі
      let delta = 0;
      if (v.orient === "h") {
        if (r !== v.row) return;
        delta = c < v.col ? c - v.col : c - (v.col + v.len - 1);
      } else {
        if (c !== v.col) return;
        delta = r < v.row ? r - v.row : r - (v.row + v.len - 1);
      }
      if (delta === 0) return;

      const { min, max } = moveRange(vehicles, id);
      // Обмежити delta допустимим діапазоном
      const clamped = Math.max(min, Math.min(max, delta));
      if (clamped === 0) return;

      const next = applyMove(vehicles, id, clamped);
      setVehicles(next);
      const moveNo = moves + 1;
      setMoves(moveNo);

      // 🔵 Транзакція в Base на кожен хід
      if (txPerMove && inMiniApp) {
        setTxStatus({ state: "pending" });
        sendMoveTx({ level, id, delta: clamped, moves: moveNo }).then((res) => {
          if (res.ok) setTxStatus({ state: "success", hash: res.hash });
          else setTxStatus({ state: res.reason });
          setTimeout(() => setTxStatus({ state: "idle" }), 3500);
        });
      }

      if (isSolved(next)) {
        setWon(true);
        const prev =
          typeof window !== "undefined"
            ? localStorage.getItem(`bus-best-${level}`)
            : null;
        const prevN = prev ? parseInt(prev, 10) : Infinity;
        if (moveNo < prevN) {
          setBest(moveNo);
          if (typeof window !== "undefined")
            localStorage.setItem(`bus-best-${level}`, String(moveNo));
        }
      }
    },
    [vehicles, won, moves, txPerMove, inMiniApp, level]
  );

  const handleCell = useCallback(
    (r: number, c: number) => {
      const grid = buildGrid(vehicles);
      const here = grid[r][c];
      if (here) {
        // клік по транспорту — вибрати/зняти вибір
        setSelected((s) => (s === here ? null : here));
      } else if (selected) {
        // клік по порожній клітинці — спробувати зрушити
        tryMoveTo(selected, r, c);
      }
    },
    [vehicles, selected, tryMoveTo]
  );

  if (vehicles.length === 0) {
    return <div className="text-zinc-400">Завантаження…</div>;
  }

  const grid = buildGrid(vehicles);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md">
      <LevelStats
        level={level}
        moves={moves}
        best={best}
        levelName={LEVELS[level].name}
      />

      <BaseStatus
        inMiniApp={inMiniApp}
        wallet={wallet}
        txPerMove={txPerMove}
        setTxPerMove={setTxPerMove}
      />

      <TxBanner status={txStatus} />

      <BoardGrid
        grid={grid}
        vehicles={vehicles}
        selected={selected}
        won={won}
        onCell={handleCell}
      />

      {won && (
        <WinPanel
          moves={moves}
          hasNext={level < LEVELS.length - 1}
          onNext={() => setLevel((l) => Math.min(LEVELS.length - 1, l + 1))}
          onReplay={() => loadLevel(level)}
        />
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        {LEVELS.map((lvl, i) => (
          <button
            key={i}
            onClick={() => setLevel(i)}
            className="px-3 py-1.5 rounded-full text-xs ring-1 transition-colors"
            style={{
              background: i === level ? MAIN_COLOR : "transparent",
              color: i === level ? "#fff" : "#a1a1aa",
              borderColor: i === level ? MAIN_COLOR : "rgba(255,255,255,0.15)",
            }}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => loadLevel(level)}
          className="px-3 py-1.5 rounded-full text-xs ring-1 ring-white/15 text-zinc-300 hover:bg-white/5"
        >
          ↻ Скинути
        </button>
      </div>

      <p className="text-xs text-zinc-500 text-center max-w-xs">
        Тапни на транспорт, потім на вільну клітинку в його ряду/стовпці, щоб
        зрушити. Виведи синій автобус 🚌 до виходу праворуч.
      </p>
    </div>
  );
}
