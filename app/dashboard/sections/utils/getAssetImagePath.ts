export function getAssetImagePath(
  symbol: string,
  type: string
): string {
  const isCrypto =
    type === 'crypto' || type === 'Crypto';

  const stockMap: Record<string, string> = {
    NFLX: 'netflix',
    AMZN: 'amazon',
    MSFT: 'microsoft',
    TSLA: 'tesla',
    V: 'visa',
    BABA: 'alibaba',
    GOOGL: 'google',
    DIS: 'disney',
    AAPL: 'apple',
  };

  if (isCrypto) {
    return `/asset/crypto/${symbol.toLowerCase()}.png`;
  }

  const filename =
    stockMap[symbol.toUpperCase()] ||
    symbol.toLowerCase();

  return `/asset/stock/${filename}.png`;
}