// Робота з гаманцем Base через Mini App SDK.
// Монетизація: кожен тап у грі надсилає КРИХІТНУ плату (fee) на гаманець-отримувач.
// Тобто гравець платить мікросуму власнику гри за кожну дію. Більше тапів → більше доходу.

// Base Mainnet
export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_HEX = "0x2105";

// Гаманець, який отримує мікроплати (твій гаманець на Base).
export const RECIPIENT = "0x378D54645EDf8A71bf7278A0F1059AC2251974Ce";

// Розмір плати за один тап у wei (нативний ETH на Base).
// 0.000002 ETH ≈ $0.005 при ціні ~$2500/ETH. Можна змінити.
// 0.000002 ETH = 2_000_000_000_000 wei = 0x1d1a94a2000
export const FEE_WEI_HEX = "0x1d1a94a2000";

let cachedAddress: string | null = null;

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// Отримати EIP-1193 провайдер з міні-аппа (працює лише всередині Base/Farcaster)
async function getProvider(): Promise<EthProvider | null> {
  try {
    const { sdk } = await import("@farcaster/miniapp-sdk");
    const provider = await sdk.wallet.getEthereumProvider();
    return (provider as EthProvider) ?? null;
  } catch {
    return null;
  }
}

// Переконатися, що активна мережа — Base (за потреби перемкнути)
async function ensureBase(provider: EthProvider): Promise<void> {
  try {
    const current = (await provider.request({ method: "eth_chainId" })) as string;
    if (current?.toLowerCase() === BASE_CHAIN_HEX) return;
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_HEX }],
    });
  } catch {
    // якщо мережа не додана — пробуємо додати
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BASE_CHAIN_HEX,
            chainName: "Base",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      });
    } catch {
      /* ігноруємо — спробуємо надіслати як є */
    }
  }
}

// Підключити гаманець (один раз кешуємо адресу)
export async function connectWallet(): Promise<string | null> {
  if (cachedAddress) return cachedAddress;
  const provider = await getProvider();
  if (!provider) return null;
  try {
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    cachedAddress = accounts?.[0] ?? null;
    return cachedAddress;
  } catch {
    return null;
  }
}

// Закодувати дані тапу у hex для поля data транзакції (прозорість on-chain)
function encodeTap(tap: TapAction): string {
  const json = JSON.stringify(tap);
  let hex = "0x";
  for (let i = 0; i < json.length; i++) {
    hex += json.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hex;
}

export type TapAction = {
  score: number; // рахунок на момент тапу
  combo: number; // поточне комбо
  ts: number; // час дії (мс)
};

export type TxResult =
  | { ok: true; hash: string }
  | { ok: false; reason: "no-wallet" | "rejected" | "error" };

// Надіслати транзакцію-мікроплату за один тап. Не кидає виняток — гра не має падати.
export async function sendTapTx(tap: TapAction): Promise<TxResult> {
  const provider = await getProvider();
  if (!provider) return { ok: false, reason: "no-wallet" };

  const address = await connectWallet();
  if (!address) return { ok: false, reason: "no-wallet" };

  await ensureBase(provider);

  try {
    const hash = (await provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: address,
          to: RECIPIENT, // мікроплата йде власнику гри
          value: FEE_WEI_HEX,
          data: encodeTap(tap),
        },
      ],
    })) as string;
    return { ok: true, hash };
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    // 4001 = користувач відхилив
    if (code === 4001) return { ok: false, reason: "rejected" };
    return { ok: false, reason: "error" };
  }
}

// Чи запущені ми всередині Base / Farcaster міні-аппа
export async function isInMiniApp(): Promise<boolean> {
  try {
    const { sdk } = await import("@farcaster/miniapp-sdk");
    return await sdk.isInMiniApp();
  } catch {
    return false;
  }
}
