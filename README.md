# 🎮 Три в ряд — Base Mini App

Класична гра «**три в ряд**» (match-3), зроблена як **Base Mini App** на Next.js + TypeScript + Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Base](https://img.shields.io/badge/Base-Mini%20App-0052ff)

## ✨ Можливості

- 🟦 Дошка 8×8 з 6 типами фішок
- 🔀 Обмін сусідніх фішок тапом
- ⛓️ Каскадні збіги з комбо-множником
- 📉 Гравітація — фішки падають, зверху з'являються нові
- 🏆 Збереження рекорду в `localStorage`
- 📱 Адаптивний дизайн під мобільні
- 🔵 Інтеграція з Base / Farcaster Mini App SDK

## 🚀 Запуск локально

```bash
npm install
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000).

## 🏗️ Збірка

```bash
npm run build
npm start
```

## 📁 Структура

```
app/
  page.tsx              # головна сторінка
  layout.tsx            # метадані + Base Mini App embed
  components/
    Match3.tsx          # UI гри (дошка, рахунок, анімації)
    MiniAppReady.tsx    # виклик sdk.actions.ready()
lib/
  game.ts               # логіка match-3 (движок)
public/
  .well-known/
    farcaster.json      # маніфест Base Mini App
```

## 🔵 Деплой як Base Mini App

1. Задеплой проєкт (наприклад, на [Vercel](https://vercel.com)).
2. У `app/layout.tsx` і `public/.well-known/farcaster.json` заміни
   `YOUR-DOMAIN.vercel.app` на свій реальний домен
   (або задай змінну середовища `NEXT_PUBLIC_URL`).
3. Додай зображення `og.png`, `icon.png`, `splash.png` у папку `public/`.
4. Зареєструй міні-апп у [Base Build](https://base.org/build) /
   через [Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
   та підпиши `accountAssociation`.

## 🎯 Як грати

Тапни на фішку, потім на сусідню, щоб поміняти їх місцями.
Збери **3 або більше** однакових фішок у ряд чи стовпець — вони зникнуть,
а ти отримаєш очки. У тебе **30 ходів**.

---

Зроблено з ❤️ на Next.js.
