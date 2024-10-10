import React from 'react';

export interface BadgeProps {
  type?: 'badge' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'outline' | 'filled' | 'filledWithBorder';
  showDot?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: string | number;
}