export class InputManager {
  private spacePressed = false;
  private spaceConsumed = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.spacePressed) {
          this.spacePressed = true;
          this.spaceConsumed = false;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spacePressed = false;
      }
    });
  }

  triggerSpace() {
    if (!this.spacePressed) {
      this.spacePressed = true;
      this.spaceConsumed = false;
    }
    setTimeout(() => { this.spacePressed = false; }, 100);
  }

  consumeSpace(): boolean {
    if (this.spacePressed && !this.spaceConsumed) {
      this.spaceConsumed = true;
      return true;
    }
    return false;
  }
}
