"use client"

import { useEffect, useRef } from 'react';

// List of selectors for actionable shadcn components
const actionableSelectors = [
  'button',
  '[role="button"]',
  '.shadcn-action',
  '.shadcn-btn',
  '.shadcn-button',
  '.shadcn-ui',
  '.shadcn-actionable',
  '.shadcn-connect',
  '.shadcn-connectable',
  '.shadcn-hover',
  '.shadcn-interactive',
  '.shadcn-primary',
  '.shadcn-secondary',
  '.shadcn-outline',
  '.shadcn-destructive',
  '.shadcn-ghost',
  '.shadcn-link',
  '.shadcn-card',
  '.shadcn-switch',
  '.shadcn-checkbox',
  '.shadcn-radio',
  '.shadcn-select',
  '.shadcn-dropdown',
  '.shadcn-menu',
  '.shadcn-list',
  '.shadcn-item',
  '.shadcn-tab',
  '.shadcn-nav',
  '.shadcn-pagination',
  '.shadcn-slider',
  '.shadcn-toggle',
  '.shadcn-toolbar',
  '.shadcn-tooltip',
  '.shadcn-popover',
  '.shadcn-dialog',
  '.shadcn-alert',
  '.shadcn-modal',
  '.shadcn-sheet',
  '.shadcn-drawer',
  '.shadcn-accordion',
  '.shadcn-collapse',
  '.shadcn-hoverable',
  '.shadcn-focusable',
  '.shadcn-pressable',
  '.shadcn-clickable',
  '.shadcn-linkable',
  '.shadcn-input',
  '.shadcn-form',
  '.shadcn-submit',
  '.shadcn-actionable',
];

function isActionable(target: HTMLElement | null): boolean {
  if (!target) return false;
  for (const sel of actionableSelectors) {
    if (target.matches(sel)) return true;
  }
  return false;
}

export default function CustomCursor() {
  // Add click animation
  useEffect(() => {
    const handleDown = () => {
      if (cursorRef.current) cursorRef.current.classList.add('custom-cursor-clicked');
    };
    const handleUp = () => {
      if (cursorRef.current) cursorRef.current.classList.remove('custom-cursor-clicked');
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
    };
  }, []);
  const cursorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const hoverTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      // Less lazy follow (snappier)
      pos.current.x += (mouse.current.x - pos.current.x) * 0.35;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.35;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x - 16}px, ${pos.current.y - 16}px, 0)`;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isActionable(target)) {
        isHovering.current = true;
        hoverTarget.current = target;
        if (cursorRef.current) cursorRef.current.classList.add('custom-cursor-hover');
      }
    };
    const handleOut = (e: MouseEvent) => {
      isHovering.current = false;
      hoverTarget.current = null;
      if (cursorRef.current) cursorRef.current.classList.remove('custom-cursor-hover');
    };
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    return () => {
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
    };
  }, []);

  // Hide default cursor
  useEffect(() => {
    document.body.classList.add('custom-cursor-hide');
    return () => document.body.classList.remove('custom-cursor-hide');
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
    </>
  );
}