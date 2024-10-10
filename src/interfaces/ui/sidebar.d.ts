import React from 'react';
import { UserProps } from '../user';

export interface SidebarProps {
  label: string;
  labelHref?: string;
  options: SidebarGroupProps[];
  user?: UserProps;
  toggleOnHover?: boolean;
}

export interface SidebarGroupProps {
  groupName: string;
  options: SidebarOptionProps[];
}

export interface SidebarOptionProps extends SidebarOptionChildrenProps {
  hasPermission?: boolean;
  children?: SidebarOptionChildrenProps[];
}

export interface SidebarOptionChildrenProps {
  name: string;
  href?: string;
  notificationCount?: number;
  icon: React.ReactNode;
  isDisabled?: boolean;
  hasPermission?: boolean,
  onClick?: () => void;
}

export interface SidebarItemGroupProps extends SidebarItemProps {
  isSidebarExpanded?: boolean;
  childs: SidebarOptionChildrenProps[]
}

export interface SidebarItemProps {
  href?: string;
  children: string | number;
  notificationCount?: number;
  icon: React.ReactNode;
  isSidebarExpanded?: boolean;
  isParent?: boolean;
  isChildren?: boolean;
  hasPermission?: boolean;
  isDisabled?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}