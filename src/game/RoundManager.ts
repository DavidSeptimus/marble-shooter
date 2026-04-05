import {
  MARBLES_PER_ROUND, TOTAL_ROUNDS, ATTEMPTS_PER_MARBLE,
  TARGET_RADII, BASE_AIM_SPEED, ROUND_SPEED_BONUS, MARBLE_SPEED_BONUS,
} from '../constants';

export class RoundManager {
  round = 1;
  marbleIndex = 0;
  attemptsLeft = ATTEMPTS_PER_MARBLE;

  reset() {
    this.round = 1;
    this.marbleIndex = 0;
    this.attemptsLeft = ATTEMPTS_PER_MARBLE;
  }

  getTargetRadius(): number {
    return TARGET_RADII[this.round - 1];
  }

  getAimSpeed(): number {
    return BASE_AIM_SPEED
      + (this.round - 1) * ROUND_SPEED_BONUS
      + this.marbleIndex * MARBLE_SPEED_BONUS;
  }

  onHit(): 'next_marble' | 'next_round' | 'win' {
    this.marbleIndex++;
    this.attemptsLeft = ATTEMPTS_PER_MARBLE;

    if (this.marbleIndex >= MARBLES_PER_ROUND) {
      this.marbleIndex = 0;
      this.round++;
      if (this.round > TOTAL_ROUNDS) {
        return 'win';
      }
      return 'next_round';
    }
    return 'next_marble';
  }

  onMiss(): 'retry' | 'game_over' {
    this.attemptsLeft--;
    if (this.attemptsLeft <= 0) {
      return 'game_over';
    }
    return 'retry';
  }
}
