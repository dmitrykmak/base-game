import TapRush from "./components/TapRush";
import MiniAppReady from "./components/MiniAppReady";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 bg-gradient-to-b from-[#0b1020] via-[#0a0e1a] to-black">
      <MiniAppReady />
      <header className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0052ff] text-white text-sm font-black">
            B
          </span>
          <span className="text-sm font-medium text-zinc-400">Base Mini App</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-[#0052ff] via-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent">
          ⚡ Base Tap Rush
        </h1>
        <p className="text-xs text-zinc-500">
          Тапай, нарощуй комбо — кожен тап у мережі Base
        </p>
      </header>

      <TapRush />

      <footer className="text-xs text-zinc-600">
        Зроблено на Next.js · Base Mini App
      </footer>
    </main>
  );
}
