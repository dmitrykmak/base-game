const sharp = require("sharp");

// Синє коло-ціль із концентричними кільцями + блискавка (векторна, без emoji).
// cx,cy — центр; R — зовнішній радіус.
function target(cx, cy, R) {
  const rings = [
    { r: R, fill: "#001a66" },
    { r: R * 0.78, fill: "#0052ff" },
    { r: R * 0.5, fill: "#3b82f6" },
    { r: R * 0.26, fill: "#93c5fd" },
  ];
  const circles = rings
    .map(
      (g) =>
        `<circle cx="${cx}" cy="${cy}" r="${g.r}" fill="${g.fill}" stroke="#ffffff22" stroke-width="${R * 0.02}"/>`,
    )
    .join("");
  // блискавка по центру
  const s = R * 0.4;
  const bolt = `<path d="M ${cx + s * 0.15} ${cy - s} L ${cx - s * 0.45} ${cy + s * 0.1} L ${cx} ${cy + s * 0.1} L ${cx - s * 0.15} ${cy + s} L ${cx + s * 0.55} ${cy - s * 0.15} L ${cx + s * 0.05} ${cy - s * 0.15} Z" fill="#ffffff"/>`;
  return circles + bolt;
}

const icon = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="180" fill="url(#bg)"/>
  ${target(512, 410, 250)}
  <text x="512" y="800" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="150" font-weight="900" fill="#3b82f6">TAP</text>
  <text x="512" y="910" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="90" font-weight="900" fill="#a855f7">RUSH</text>
</svg>`;

const splash = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <rect width="400" height="400" fill="#0a0e1a"/>
  ${target(200, 160, 110)}
  <text x="200" y="330" text-anchor="middle" font-family="Arial" font-size="46" font-weight="900" fill="#3b82f6">Base Tap Rush</text>
</svg>`;

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${target(300, 315, 200)}
  <text x="600" y="270" text-anchor="start" font-family="Arial,Helvetica,sans-serif"
        font-size="88" font-weight="900" fill="#3b82f6">Base Tap Rush</text>
  <text x="600" y="345" text-anchor="start" font-family="Arial,Helvetica,sans-serif"
        font-size="40" fill="#e4e4e7">Тапай · комбо · множник x5</text>
  <text x="600" y="425" text-anchor="start" font-family="Arial,Helvetica,sans-serif"
        font-size="34" fill="#a1a1aa">Кожен тап — транзакція в Base</text>
</svg>`;

async function run() {
  await sharp(Buffer.from(icon)).png().toFile("public/icon.png");
  await sharp(Buffer.from(splash)).png().toFile("public/splash.png");
  await sharp(Buffer.from(og)).png().toFile("public/og.png");
  console.log("✓ icon.png, splash.png, og.png створено (Base Tap Rush)");
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
