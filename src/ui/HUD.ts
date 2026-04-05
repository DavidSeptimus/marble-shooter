export class HUD {
  private roundEl: HTMLElement;
  private marbleEl: HTMLElement;
  private attemptsEl: HTMLElement;
  private centerEl: HTMLElement;
  private bottomEl: HTMLElement;
  private centerTimeout: ReturnType<typeof setTimeout> | null = null;
  private touchMode: boolean;

  constructor() {
    this.roundEl = document.getElementById('round-display')!;
    this.marbleEl = document.getElementById('marble-display')!;
    this.attemptsEl = document.getElementById('hud-top-right')!;
    this.centerEl = document.getElementById('hud-center')!;
    this.bottomEl = document.getElementById('hud-bottom')!;
    this.touchMode = 'ontouchstart' in window
      || navigator.maxTouchPoints > 0
      || matchMedia('(pointer: coarse)').matches;
  }

  updateRound(round: number) {
    this.roundEl.textContent = `Round ${round} / 3`;
  }

  updateMarble(index: number) {
    this.marbleEl.textContent = `Marble ${index + 1} / 10`;
  }

  updateAttempts(remaining: number) {
    // Remove only the attempt dots, preserve other children (e.g. mute button)
    this.attemptsEl.querySelectorAll('.attempt-dot').forEach(el => el.remove());
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = `attempt-dot${i < remaining ? ' filled' : ''}`;
      this.attemptsEl.appendChild(dot);
    }
  }

  showMessage(text: string, duration = 1500) {
    if (this.centerTimeout) clearTimeout(this.centerTimeout);
    this.centerEl.textContent = text;
    this.centerEl.classList.add('visible');
    if (duration > 0) {
      this.centerTimeout = setTimeout(() => {
        this.centerEl.classList.remove('visible');
      }, duration);
    }
  }

  showPersistentMessage(text: string) {
    if (this.centerTimeout) clearTimeout(this.centerTimeout);
    this.centerEl.textContent = text;
    this.centerEl.classList.add('visible');
  }

  hideMessage() {
    if (this.centerTimeout) clearTimeout(this.centerTimeout);
    this.centerEl.classList.remove('visible');
  }

  setInstruction(text: string) {
    // On touch devices, the button is the affordance — hide text instructions
    this.bottomEl.textContent = this.touchMode ? '' : text;
  }
}
