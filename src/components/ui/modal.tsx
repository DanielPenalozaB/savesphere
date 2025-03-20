'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import Button, { ButtonProps } from '@/components/ui/button';
import { EllipsisVerticalIcon } from '../icons/ellipsis-vertical';
import { XMarkIcon } from '../icons/xmark';
import { DropdownMenu, DropdownOption } from './dropdown';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  editableTitle?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  description?: string;
  className?: string;
  children: React.ReactNode;
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  animation?: {
    duration?: number;
    ease?: string;
  };
  modalOptions?: DropdownOption[];
}

export default function Modal({
  isOpen,
  onClose,
  title,
  editableTitle,
  description,
  className,
  children,
  primaryButton,
  secondaryButton,
  size = 'md',
  animation = {},
  modalOptions
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [ isRendered, setIsRendered ] = useState(isOpen);

  // Combined animation settings
  const animationSettings = useMemo(() => ({
    duration: 0.5,
    ease: 'power3.out',
    ...animation
  }), [ animation ]);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-5xl'
  };

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
  }, [ isOpen, isRendered, animationSettings.duration, animationSettings.ease ]);

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
          <div className="flex w-full max-w-md flex-col gap-1.5 text-center sm:text-left">
            {editableTitle ? (
              <input
                type="text"
                value={editableTitle.value}
                onChange={(e) => editableTitle.onChange(e.target.value)}
                placeholder={editableTitle.placeholder || 'Enter title...'}
                className="w-full rounded-md bg-transparent px-2 py-1 text-xl font-semibold text-neutral-600 outline-none transition-all duration-150 ease-in hover:bg-neutral-100 focus:outline-2 focus:outline-offset-0 focus:outline-neutral-200"
                autoFocus={editableTitle.value.length === 0}
              />
            ) : (
              <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-neutral-500">
                {description}
              </p>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {modalOptions && (
              <DropdownMenu position='bottom-right' options={modalOptions}>
                <button className="flex-shrink-0 rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </DropdownMenu>
            )}
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className={`relative h-full w-full overflow-hidden ${className}`}>
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