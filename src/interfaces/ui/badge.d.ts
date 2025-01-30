import React from 'react';
import { Size, Variant } from './general';

export interface BadgeProps {
  type?: 'badge' | 'pill';
  size?: Size;
  variant?: Variant;
  showDot?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: string | number;
}