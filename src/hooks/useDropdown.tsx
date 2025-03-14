import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';

interface UseDropdownOptions {
  enableEscapeKey?: boolean; // Whether to close the dropdown on Escape key press
  onOpen?: () => void; // Callback when the dropdown opens
  onClose?: () => void; // Callback when the dropdown closes
  initialIsOpen?: boolean; // Initial state of the dropdown
  animation?: {
    open?: {
      duration?: number; // Duration of the open animation
      ease?: string; // Easing function for the open animation
      opacity?: number; // Target opacity for the open animation
      y?: number; // Target y position for the open animation
    };
    close?: {
      duration?: number; // Duration of the close animation
      ease?: string; // Easing function for the close animation
      opacity?: number; // Target opacity for the close animation
      y?: number; // Target y position for the close animation
    };
  };
}

export function useDropdown<T extends HTMLElement = HTMLDivElement>(options: UseDropdownOptions = {}) {
  const {
    enableEscapeKey = true,
    onOpen,
    onClose,
    initialIsOpen = false,
    animation = {} // Default to an empty object if no animation config is provided
  } = options;

  const [ isOpen, setIsOpen ] = useState<boolean>(initialIsOpen);
  const dropdownRef = useRef<T | null>(null);

  // Add a ref to track if we've already animated the opening
  const hasAnimatedRef = useRef<boolean>(false);

  // Default animation values
  const defaultAnimation = {
    open: {
      duration: 0.3,
      ease: 'elastic.out(1, 0.75)',
      opacity: 1,
      y: 0
    },
    close: {
      duration: 0.2,
      ease: 'power2.in',
      opacity: 0,
      y: -10
    }
  };

  // Memoize the animation configurations
  const openAnimation = useMemo(() => ({
    ...defaultAnimation.open,
    ...animation.open
  }), [ animation.open, defaultAnimation.open ]);

  const closeAnimation = useMemo(() => ({
    ...defaultAnimation.close,
    ...animation.close
  }), [ animation.close, defaultAnimation.close ]);

  // GSAP animation for opening the dropdown
  const animateOpen = useCallback(() => {
    if (dropdownRef.current) {
      // Set initial styles before animating
      gsap.set(dropdownRef.current, { opacity: 0, y: -10 });

      // Animate to the final state using the provided or default values
      gsap.to(dropdownRef.current, {
        opacity: openAnimation.opacity,
        y: openAnimation.y,
        duration: openAnimation.duration,
        ease: openAnimation.ease,
        onComplete: () => {
          hasAnimatedRef.current = true;
        }
      });
    }
  }, [ openAnimation ]);

  // GSAP animation for closing the dropdown
  const animateClose = useCallback(() => {
    if (dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: closeAnimation.opacity,
        y: closeAnimation.y,
        duration: closeAnimation.duration,
        ease: closeAnimation.ease,
        onComplete: () => {
          setIsOpen(false); // Close the dropdown after animation
          hasAnimatedRef.current = false; // Reset animation flag
        }
      });
    }
  }, [ closeAnimation ]);

  // Handle opening the dropdown
  const openDropdown = useCallback(() => {
    setIsOpen(true); // Set isOpen to true to render the dropdown
    hasAnimatedRef.current = false; // Reset animation flag to ensure it animates when opening
    if (onOpen) onOpen();
  }, [ onOpen ]);

  // Handle closing the dropdown
  const closeDropdown = useCallback(() => {
    if (!isOpen) return; // Don't try to close if already closed

    animateClose(); // Animate closing
    if (onClose) onClose();
  }, [ isOpen, onClose, animateClose ]);

  // Toggle the dropdown
  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [ isOpen, openDropdown, closeDropdown ]);

  // Animate open ONLY when the dropdown is INITIALLY rendered
  // This is the key fix that prevents re-animations during searches
  useEffect(() => {
    if (isOpen && dropdownRef.current && !hasAnimatedRef.current) {
      animateOpen();
    }
  }, [ isOpen, animateOpen ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ closeDropdown ]);

  // Close dropdown when Escape key is pressed
  useEffect(() => {
    if (!enableEscapeKey) return;

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [ enableEscapeKey, closeDropdown ]);

  return {
    isOpen,
    dropdownRef,
    toggleDropdown,
    openDropdown,
    closeDropdown
  };
}