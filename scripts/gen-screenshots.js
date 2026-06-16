// Генерація скріншотів для каталогу Base.dev (портрет, формат телефону 1284×2778).
// Малюємо UI гри векторно (sharp НЕ рендерить кольорові emoji — лише фігури+текст).
const sharp = require("sharp");

const W = 1284;
const H = 2778;
const BLUE = "#0052ff";
const PURPLE = "#a855f7";

// Кнопка-ціль (концентричні кільця + блискавка)
function target(cx, cy, R) {
  const rings = [
    { r: R, fill: "#001a66" },
    { r: R * 0.78, fill: BLUE },
    { r: R * 0.5, fill: "#3b82f6" },
    { r: R * 0.26, fill: "#93c5fd" },
  ]
    .map(
      (g) =>
        `<circle cx="${cx}" cy="${cy}" r="${g.r}" fill="${g.fill}" stroke="#ffffff22" stroke-width="${R * 0.02}"/>`,
    )
    .join("");
  const s = R * 0.42;
  const bolt = `<path d="M ${cx + s * 0.15} ${cy - s} L ${cx - s * 0.45} ${cy + s * 0.1} L ${cx} ${cy + s * 0.1} L ${cx - s * 0.15} ${cy + s} L ${cx + s * 0.55} ${cy - s * 0.15} L ${cx + s * 0.05} ${cy - s * 0.15} Z" fill="#ffffff"/>`;
  return rings + bolt;
}

function header() {
  return `
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bg)"/>
    <rect x="${W / 2 - 30}" y="150" width="60" height="60" rx="14" fill="${BLUE}"/>
    <text x="${W / 2}" y="193" text-anchor="middle" font-family="Arial" font-size="42" font-weight="900" fill="#fff">B</text>
    <text x="${W / 2}" y="300" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="78" font-weight="900" fill="#3b82f6">Base Tap Rush</text>
    <text x="${W / 2}" y="360" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="38" fill="#a1a1aa">Тапай · комбо · множник x5</text>`;
}

// статистична картка
function stat(x, y, w, label, value, big) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="150" rx="22" fill="#ffffff10" stroke="#ffffff18"/>
    <text x="${x + w / 2}" y="${y + 52}" text-anchor="middle" font-family="Arial" font-size="28" fill="#71717a">${label}</text>
    <text x="${x + w / 2}" y="${y + 115}" text-anchor="middle" font-family="Arial" font-size="${big ? 72 : 56}" font-weight="900" fill="${big ? "#fff" : "#e4e4e7"}">${value}</text>`;
}

const defs = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0b1020"/><stop offset="0.6" stop-color="#0a0e1a"/><stop offset="1" stop-color="#000000"/>
  </linearGradient>
</defs>`;

// СКРІН 1 — геймплей
const shot1 = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${defs}
  ${header()}
  ${stat(70, 470, 350, "ОЧКИ", "1 240", true)}
  ${stat(467, 470, 350, "ТАПІВ", "47")}
  ${stat(864, 470, 350, "КОМБО", "x47")}
  <text x="${W / 2}" y="780" text-anchor="middle" font-family="Arial" font-size="44" font-weight="900" fill="${PURPLE}">COMBO x47 · 5× очок</text>
  <rect x="${W / 2 - 300}" y="830" width="600" height="16" rx="8" fill="#ffffff15"/>
  <rect x="${W / 2 - 300}" y="830" width="430" height="16" rx="8" fill="${PURPLE}"/>
  ${target(W / 2, 1280, 360)}
  <text x="${W / 2}" y="1305" text-anchor="middle" font-family="Arial" font-size="110" font-weight="900" fill="#fff">TAP</text>
  <text x="${W / 2}" y="1850" text-anchor="middle" font-family="Arial" font-size="40" fill="#52525b">Кожен тап — транзакція в мережі Base</text>
  <rect x="${W / 2 - 420}" y="2400" width="840" height="2" fill="#ffffff10"/>
  <text x="${W / 2}" y="2520" text-anchor="middle" font-family="Arial" font-size="38" fill="#3f3f46">Base Mini App · Next.js</text>
</svg>`;

// СКРІН 2 — досягнення
function achCell(x, y, icon, label, got) {
  const bg = got ? "#0052ff26" : "#ffffff08";
  const stroke = got ? "#0052ff66" : "#ffffff12";
  return `
    <rect x="${x}" y="${y}" width="340" height="280" rx="26" fill="${bg}" stroke="${stroke}" stroke-width="2"/>
    <circle cx="${x + 170}" cy="${y + 110}" r="55" fill="${got ? BLUE : "#27272a"}"/>
    <text x="${x + 170}" y="${y + 128}" text-anchor="middle" font-family="Arial" font-size="56" font-weight="900" fill="#fff">${icon}</text>
    <text x="${x + 170}" y="${y + 220}" text-anchor="middle" font-family="Arial" font-size="32" fill="${got ? "#e4e4e7" : "#52525b"}">${label}</text>`;
}
const shot2 = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${defs}
  ${header()}
  <text x="${W / 2}" y="540" text-anchor="middle" font-family="Arial" font-size="58" font-weight="900" fill="#fff">Досягнення</text>
  <text x="${W / 2}" y="600" text-anchor="middle" font-family="Arial" font-size="40" fill="#a1a1aa">Розблоковано 7 з 9</text>
  ${achCell(70, 700, "1", "Перший тап", true)}
  ${achCell(472, 700, "5", "На розігріві", true)}
  ${achCell(874, 700, "X", "У вогні", true)}
  ${achCell(70, 1010, "25", "Майстер комбо", true)}
  ${achCell(472, 1010, "50", "Розкочегарився", true)}
  ${achCell(874, 1010, "200", "Тап-машина", false)}
  ${achCell(70, 1320, "500", "Перша сотня", true)}
  ${achCell(472, 1320, "2K", "Серйозний", true)}
  ${achCell(874, 1320, "5K", "Легенда", false)}
  <text x="${W / 2}" y="1750" text-anchor="middle" font-family="Arial" font-size="40" fill="#52525b">Кожне досягнення — окрема нагорода on-chain</text>
  <text x="${W / 2}" y="2520" text-anchor="middle" font-family="Arial" font-size="38" fill="#3f3f46">Base Mini App · Next.js</text>
</svg>`;

// СКРІН 3 — лідерборд
function rank(x, y, place, score, detail, top) {
  const medalColor = place === 1 ? "#facc15" : place === 2 ? "#cbd5e1" : place === 3 ? "#d97706" : "#3f3f46";
  return `
    <rect x="${x}" y="${y}" width="1144" height="120" rx="22" fill="${top ? "#0052ff1f" : "#ffffff08"}" stroke="${top ? "#0052ff55" : "#ffffff10"}" stroke-width="2"/>
    <circle cx="${x + 65}" cy="${y + 60}" r="38" fill="${medalColor}"/>
    <text x="${x + 65}" y="${y + 78}" text-anchor="middle" font-family="Arial" font-size="42" font-weight="900" fill="#0a0e1a">${place}</text>
    <text x="${x + 150}" y="${y + 78}" font-family="Arial" font-size="54" font-weight="900" fill="#fff">${score}</text>
    <text x="${x + 1094}" y="${y + 76}" text-anchor="end" font-family="Arial" font-size="34" fill="#71717a">${detail}</text>`;
}
const shot3 = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${defs}
  ${header()}
  <text x="${W / 2}" y="560" text-anchor="middle" font-family="Arial" font-size="58" font-weight="900" fill="#fff">Топ результатів</text>
  ${rank(70, 680, 1, "5 420", "180 тапів · комбо x82", true)}
  ${rank(70, 820, 2, "3 180", "120 тапів · комбо x60")}
  ${rank(70, 960, 3, "2 540", "60 тапів · комбо x60")}
  ${rank(70, 1100, 4, "1 240", "47 тапів · комбо x47")}
  ${rank(70, 1240, 5, "860", "32 тапи · комбо x32")}
  <text x="${W / 2}" y="1500" text-anchor="middle" font-family="Arial" font-size="40" fill="#52525b">Змагайся за перше місце!</text>
  <text x="${W / 2}" y="2520" text-anchor="middle" font-family="Arial" font-size="38" fill="#3f3f46">Base Mini App · Next.js</text>
</svg>`;

async function run() {
  await sharp(Buffer.from(shot1)).png().toFile("public/screenshot-1.png");
  await sharp(Buffer.from(shot2)).png().toFile("public/screenshot-2.png");
  await sharp(Buffer.from(shot3)).png().toFile("public/screenshot-3.png");
  console.log("✓ screenshot-1/2/3.png створено (портрет 1284×2778)");
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
