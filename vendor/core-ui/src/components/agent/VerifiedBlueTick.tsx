import React from 'react';

export interface VerifiedBlueTickProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const VerifiedBlueTick: React.FC<VerifiedBlueTickProps> = ({
  size = 16,
  className = '',
  style = {},
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`verified-blue-tick ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    >
      <title>Verified Official Agent</title>
      {/* WhatsApp / Meta Verified Scalloped Badge */}
      <path
        d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4944 3.73889C14.8967 4.18055 15.469 4.41762 16.0597 4.38718L17.5518 4.31033C18.7161 4.25032 19.6856 5.21981 19.6256 6.38407L19.5487 7.87625C19.5183 8.46691 19.7554 9.03923 20.197 9.44148L21.3122 10.4572C22.1834 11.2506 22.1834 12.6212 21.3122 13.4146L20.197 14.4304C19.7554 14.8326 19.5183 15.4049 19.5487 15.9956L19.6256 17.4878C19.6856 18.652 18.7161 19.6215 17.5518 19.5615L16.0597 19.4847C15.469 19.4542 14.8967 19.6913 14.4944 20.133L13.4787 21.2482C12.6853 22.1193 11.3147 22.1193 10.5213 21.2482L9.5056 20.133C9.10335 19.6913 8.53103 19.4542 7.94037 19.4847L6.44819 19.5615C5.28393 19.6215 4.31444 18.652 4.37445 17.4878L4.4513 15.9956C4.48174 15.4049 4.24467 14.8326 3.80301 14.4304L2.6878 13.4146C1.81667 12.6212 1.81667 11.2506 2.6878 10.4572L3.80301 9.44148C4.24467 9.03923 4.48174 8.46691 4.4513 7.87625L4.37445 6.38407C4.31444 5.21981 5.28393 4.25032 6.44819 4.31033L7.94037 4.38718C8.53103 4.41762 9.10335 4.18055 9.5056 3.73889L10.5213 2.62368Z"
        fill="#007AFF"
      />
      {/* Crisp White Checkmark */}
      <path
        d="M8.75 12L10.95 14.2L15.25 9.8"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
