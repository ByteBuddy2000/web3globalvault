export default function Tag({ type }: { type: string }) {
  const isCrypto = type === 'crypto' || type === 'Crypto';

  return (
    <span
      className={`dashboard-tag ${
        isCrypto
          ? 'dashboard-tag-crypto'
          : 'dashboard-tag-stock'
      }`}
    >
      {isCrypto ? 'CRYPTO' : 'STOCK'}
    </span>
  );
}