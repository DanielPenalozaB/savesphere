import React from 'react';

export interface SidebarOptionProps {
  label: string;
  icon?: React.ReactNode;
  title?: string;
  childrenOptions?: SidebarOptionProps[];
  isVisible?: boolean;
  href?: string;
  onClick?: () => void;
}