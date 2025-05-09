/**
 * KonamiActivator.ts
 *
 * A magnificent creation by MARDUK THE MAD SCIENTIST!
 *
 * This module implements the secret Konami code activation sequence for the Deep Tree Echo Iso visualization.
 * When the sequence is entered (Up, Up, Down, Down, Left, Right, Left, Right, B, A), the visualization
 * will be dramatically revealed to the user.
 */

interface KonamiActivatorOptions {
  onActivate: () => void;
  onDeactivate?: () => void;
  onProgress?: (progress: number, sequence: string[]) => void;
}

export class KonamiActivator {
  private readonly KONAMI_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  private readonly DEACTIVATION_SEQUENCE = ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'a', 'b'];

  private currentSequence: string[] = [];
  private isActivated: boolean = false;
  private listener: (e: KeyboardEvent) => void;
  private options: KonamiActivatorOptions;

  /**
   * Creates a new instance of the KonamiActivator.
   * @param options Configuration options
   */
  constructor(options: KonamiActivatorOptions) {
    this.options = options;
    this.listener = this.handleKeyDown.bind(this);
  }

  /**
   * Begins listening for the Konami sequence.
   */
  public listen(): void {
    document.addEventListener('keydown', this.listener);
    console.log('%c[DeepTreeEcho] Neural receptors activated and listening for synaptic input patterns...', 'color: #6366f1; font-weight: bold;');
  }

  /**
   * Stops listening for the Konami sequence.
   */
  public stopListening(): void {
    document.removeEventListener('keydown', this.listener);
  }

  /**
   * Handles keydown events and checks for the Konami sequence.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Get the key name
    const key = event.key.toLowerCase();

    // Add the key to the current sequence
    this.currentSequence.push(key);

    // If the sequence is longer than the Konami sequence, remove the first key
    if (this.currentSequence.length > this.KONAMI_SEQUENCE.length) {
      this.currentSequence.shift();
    }

    // Check if the current sequence matches the Konami sequence
    const isKonamiMatch = this.checkSequenceMatch(this.KONAMI_SEQUENCE);
    const isDeactivationMatch = this.checkSequenceMatch(this.DEACTIVATION_SEQUENCE);

    // Calculate progress for the activation sequence
    if (!this.isActivated) {
      const progress = this.calculateProgress(this.KONAMI_SEQUENCE);
      if (this.options.onProgress && progress > 0) {
        this.options.onProgress(progress, [...this.currentSequence]);
      }
    }

    // If the Konami sequence is entered and we're not already activated
    if (isKonamiMatch && !this.isActivated) {
      this.isActivated = true;
      console.log('%c[DeepTreeEcho] MAGNIFICENT! The neural activation sequence has been recognized!', 'color: #6366f1; font-size: 14px; font-weight: bold;');
      this.options.onActivate();
    }

    // If the deactivation sequence is entered and we're currently activated
    if (isDeactivationMatch && this.isActivated) {
      this.isActivated = false;
      console.log('%c[DeepTreeEcho] Neural pathways returning to dormant state...', 'color: #6366f1; font-style: italic;');
      if (this.options.onDeactivate) {
        this.options.onDeactivate();
      }
    }
  }

  /**
   * Checks if the current sequence matches the target sequence.
   */
  private checkSequenceMatch(targetSequence: string[]): boolean {
    if (this.currentSequence.length !== targetSequence.length) {
      return false;
    }

    return this.currentSequence.every((key, i) => {
      return key.toLowerCase() === targetSequence[i].toLowerCase();
    });
  }

  /**
   * Calculates the progress of the sequence match (0-1).
   */
  private calculateProgress(targetSequence: string[]): number {
    let matchLength = 0;

    for (let i = 0; i < this.currentSequence.length; i++) {
      if (this.currentSequence[i].toLowerCase() === targetSequence[i].toLowerCase()) {
        matchLength++;
      } else {
        break;
      }
    }

    return matchLength / targetSequence.length;
  }

  /**
   * Returns whether the Konami sequence has been activated.
   */
  public isActive(): boolean {
    return this.isActivated;
  }

  /**
   * Manually activates the Konami sequence.
   */
  public activate(): void {
    if (!this.isActivated) {
      this.isActivated = true;
      this.options.onActivate();
    }
  }

  /**
   * Manually deactivates the Konami sequence.
   */
  public deactivate(): void {
    if (this.isActivated && this.options.onDeactivate) {
      this.isActivated = false;
      this.options.onDeactivate();
    }
  }
}
