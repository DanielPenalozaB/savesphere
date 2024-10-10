import { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export default function Heading({ children, level = 1, className }: HeadingProps) {
  if (level < 1 || level > 6) {
    throw new Error('Heading level must be between 1 and 6');
  }

  const HeadingComponent = `h${level}` as keyof JSX.IntrinsicElements;

  let headingClassName = 'font-bold text-neutral-700 dark:text-white';

  switch (level) {
  case 1:

  default: {
    headingClassName += ' text-5xl';
    break;
  }

  case 2: {
    headingClassName += ' text-4xl';
    break;
  }

  case 3: {
    headingClassName += ' text-3xl';
    break;
  }

  case 4: {
    headingClassName += ' text-2xl';
    break;
  }

  case 5: {
    headingClassName += ' text-xl';
    break;
  }

  case 6: {
    headingClassName += ' text-lg';
    break;
  }
  }

  if (className) {
    headingClassName += ` ${className}`;
  }

  return (
    <HeadingComponent className={headingClassName}>
      {children}
    </HeadingComponent>
  );
}