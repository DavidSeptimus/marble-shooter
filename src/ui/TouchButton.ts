import { InputManager } from '../core/InputManager';

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || matchMedia('(pointer: coarse)').matches;
}

export function initTouchButton(input: InputManager): void {
  if (!isTouchDevice()) return;

  const btn = document.getElementById('touch-btn');
  if (!btn) return;

  btn.style.display = 'block';

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    navigator.vibrate?.(15);
    input.triggerSpace();
  });

  btn.addEventListener('pointerup', () => {
    btn.classList.remove('pressed');
  });

  btn.addEventListener('pointerleave', () => {
    btn.classList.remove('pressed');
  });
}
