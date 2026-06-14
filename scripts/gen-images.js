const sharp = require("sharp");

const COLORS = ["#38bdf8", "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7"];

// намалювати ряд кольорових фішок (кружечків) по центру
function gems(cx, cy, r, gap, colors) {
  const total = colors.length;
  const startX = cx - ((total - 1) * gap) / 2;
  return colors
    .map((c, i) => {
      const x = startX + i * gap;
      return `<circle cx="${x}" cy="${cy}" r="${r}" fill="${c}">
        <animate/></circle>
        <circle cx="${x}" cy="${cy}" r="${r}" fill="${c}" stroke="#ffffff22" stroke-width="2"/>`;
    })
    .join("");
}

const icon = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="180" fill="url(#bg)"/>
  ${gems(512, 300, 70, 165, COLORS.slice(0, 3))}
  ${gems(512, 460, 70, 165, COLORS.slice(3, 6))}
  <text x="512" y="700" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="130" font-weight="900" fill="#3b82f6">Три</text>
  <text x="512" y="830" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="130" font-weight="900" fill="#a855f7">в ряд</text>
</svg>`;

const splash = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <rect width="400" height="400" fill="#0a0e1a"/>
  ${gems(200, 150, 40, 92, COLORS.slice(0, 3))}
  <text x="200" y="300" text-anchor="middle" font-family="Arial" font-size="48" font-weight="900" fill="#3b82f6">Три в ряд</text>
</svg>`;

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${gems(600, 200, 55, 140, COLORS)}
  <text x="600" y="430" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="110" font-weight="900" fill="#3b82f6">Три в ряд</text>
  <text x="600" y="510" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="42" fill="#a1a1aa">Match-3 гра · Base Mini App</text>
</svg>`;

async function run() {
  await sharp(Buffer.from(icon)).png().toFile("public/icon.png");
  await sharp(Buffer.from(splash)).png().toFile("public/splash.png");
  await sharp(Buffer.from(og)).png().toFile("public/og.png");
  console.log("✓ icon.png, splash.png, og.png створено (кольорові фігури)");
}
run().catch((e) => { console.error(e); process.exit(1); });
