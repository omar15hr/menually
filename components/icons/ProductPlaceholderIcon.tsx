interface ProductPlaceholderIconProps {
  size?: number;
}

export default function ProductPlaceholderIcon({ size = 28 }: ProductPlaceholderIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity={0.6}>
      <path d="M3 2l1.5 1.5M21 2l-1.5 1.5M12 2v2M4.5 6A7.5 7.5 0 0 0 12 21a7.5 7.5 0 0 0 7.5-7.5c0-3-1.7-5.6-4.2-6.9" />
      <path d="M12 6a6 6 0 0 1 6 6" />
    </svg>
  );
}
