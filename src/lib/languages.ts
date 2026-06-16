// Multi-language voice-over configuration for the AI Tutor Bot

export interface VoiceOption {
  id: string
  label: string
  nativeLabel: string
  language: string // BCP-47 code for TTS prompt
  voice: string // z-ai TTS voice id
  flag: string
  greeting: string
}

export const VOICES: VoiceOption[] = [
  {
    id: 'en',
    label: 'English',
    nativeLabel: 'English',
    language: 'English',
    voice: 'tongtong',
    flag: '🇬🇧',
    greeting: "Hi friend! Let's solve this together.",
  },
  {
    id: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    language: 'Hindi',
    voice: 'tongtong',
    flag: '🇮🇳',
    greeting: 'नमस्ते दोस्त! आइए इसे साथ मिलकर हल करें।',
  },
  {
    id: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    language: 'Kannada',
    voice: 'tongtong',
    flag: '🦁',
    greeting: 'ನಮಸ್ಕಾರ ಸ್ನೇಹಿತ! ಒಟ್ಟಿಗೆ ಪರಿಹರಿಸೋಣ.',
  },
]

export function getVoiceById(id: string): VoiceOption {
  return VOICES.find((v) => v.id === id) ?? VOICES[0]
}
