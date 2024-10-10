import { SVGAttributes } from 'react';

export function ThreeBarsIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_230_50228)">
        <path d="M23 11H1C0.447715 11 0 11.4477 0 12C0 12.5523 0.447715 13 1 13H23C23.5523 13 24 12.5523 24 12C24 11.4477 23.5523 11 23 11Z" />
        <path d="M23 4H1C0.447715 4 0 4.44772 0 5C0 5.55228 0.447715 6 1 6H23C23.5523 6 24 5.55228 24 5C24 4.44772 23.5523 4 23 4Z" />
        <path d="M23 18H1C0.447715 18 0 18.4477 0 19C0 19.5523 0.447715 20 1 20H23C23.5523 20 24 19.5523 24 19C24 18.4477 23.5523 18 23 18Z" />
      </g>
      <defs>
        <clipPath id="clip0_230_50228">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}