'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Button, { ButtonProps } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  size?: 'sm' | 'md' | 'lg';
  animation?: {
    duration?: number;
    ease?: string;
  };
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryButton,
  secondaryButton,
  size = 'md',
  animation = {}
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [ isRendered, setIsRendered ] = useState(isOpen);

  // Default animation settings
  const defaultAnimation = {
    duration: 0.5,
    ease: 'power3.out'
  };

  // Combined animation settings
  const animationSettings = {
    ...defaultAnimation,
    ...animation
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  // Handle modal opening animation
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);

      // Animate the background
      if (modalRef.current) {
        gsap.set(modalRef.current, { opacity: 0 });
        gsap.to(modalRef.current, {
          opacity: 1,
          duration: animationSettings.duration / 2,
          ease: animationSettings.ease
        });
      }

      // Animate the modal content
      if (contentRef.current) {
        gsap.set(contentRef.current, {
          opacity: 0,
          y: -20,
          scale: 0.95
        });
        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: animationSettings.duration,
          ease: animationSettings.ease
        });
      }
    } else if (isRendered) {
      // Animate closing
      if (modalRef.current && contentRef.current) {
        // Animate the modal content out
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -20,
          scale: 0.95,
          duration: animationSettings.duration / 1.5,
          ease: 'power2.in'
        });

        // Animate the background out
        gsap.to(modalRef.current, {
          opacity: 0,
          duration: animationSettings.duration / 1.5,
          ease: 'power2.in',
          onComplete: () => {
            setIsRendered(false);
          }
        });
      } else {
        setIsRendered(false);
      }
    }
  }, [ isOpen, animation, animationSettings.duration, animationSettings.ease, isRendered ]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ isOpen, onClose ]);

  // Close on background click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isRendered) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/30 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className={`flex flex-col gap-6 w-full ${sizeClasses[size]} rounded-xl bg-white p-6 shadow-lg max-h-[90vh]`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
            {description && (
              <p className="text-sm text-neutral-500">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-1">
          {children}
        </div>
        {(primaryButton || secondaryButton) && (
          <div className="mt-auto flex justify-end gap-3 border-t border-neutral-100 pt-4">
            {secondaryButton && (
              <Button {...secondaryButton}>
                {secondaryButton.children}
              </Button>
            )}
            {primaryButton && (
              <Button {...primaryButton}>
                {primaryButton.children}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}