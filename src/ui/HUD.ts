export class HUD {
  private roundEl: HTMLElement;
  private marbleEl: HTMLElement;
  private attemptsEl: HTMLElement;
  private centerEl: HTMLElement;
  private bottomEl: HTMLElement;
  private centerTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.roundEl = document.getElementById('round-display')!;
    this.marbleEl = document.getElementById('marble-display')!;
    this.attemptsEl = document.getElementById('hud-top-right')!;
    this.centerEl = document.getElementById('hud-center')!;
    this.bottomEl = document.getElementById('hud-bottom')!;
  }

  updateRound(round: number) {
    this.roundEl.textContent = `Round ${round} / 3`;
  }

  updateMarble(index: number) {
    this.marbleEl.textContent = `Marble ${index + 1} / 10`;
  }

  updateAttempts(remaining: number) {
    const dots = [];
    for (let i = 0; i < 3; i++) {
      const filled = i < remaining ? 'filled' : '';
      dots.push(`<div class="attempt-dot ${filled}"></div>`);
    }
    this.attemptsEl.innerHTML = dots.join('');
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
    this.bottomEl.textContent = text;
  }
}
