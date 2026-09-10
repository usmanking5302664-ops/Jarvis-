export class JarvisSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: string = 'ur-PK'; // default supports Urdu & English
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onStateChangeCallback: ((listening: boolean) => void) | null = null;
  private onErrorCallback: ((err: string) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChangeCallback?.(true);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText && this.onResultCallback) {
          this.onResultCallback(currentText, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          this.onErrorCallback?.(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChangeCallback?.(false);
      };
    }
  }

  public setLanguage(lang: 'ur-PK' | 'en-US') {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }

  public isSupported(): boolean {
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onStateChange: (listening: boolean) => void,
    onError: (err: string) => void
  ) {
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (this.recognition) {
      try {
        this.recognition.lang = this.currentLanguage;
        this.recognition.start();
      } catch (e: any) {
        console.warn('Speech start warning:', e);
      }
    } else {
      onError('Speech Recognition is not supported on this browser/environment.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    this.onStateChangeCallback?.(false);
  }

  public speak(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    // Detect if text contains Urdu characters
    const hasUrdu = /[\u0600-\u06FF]/.test(text);
    utterance.lang = hasUrdu ? 'ur-PK' : 'en-GB'; // English GB gives iconic Jarvis accent!
    utterance.rate = 1.0;
    utterance.pitch = 0.95; // slightly lower pitch for suave AI voice

    // Try finding a matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v => 
        hasUrdu 
          ? (v.lang.startsWith('ur') || v.lang.startsWith('ar') || v.lang.startsWith('hi')) 
          : (v.lang.includes('en-GB') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Google UK'))
      );
      if (match) {
        utterance.voice = match;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const jarvisSpeech = new JarvisSpeechService();
