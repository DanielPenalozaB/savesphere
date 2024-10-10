import { SVGAttributes } from 'react';

export function SmallChevronIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 3.33335L10.6667 8.00002L6 12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}