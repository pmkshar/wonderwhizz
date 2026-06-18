// Multi-language voice-over configuration for the AI Tutor Bot
// All voices use Indian-accent (hi-IN / kn-IN / en-IN) system voices via the
// browser's SpeechSynthesis API. The zai TTS `voice` field is only used as a
// fallback when SpeechSynthesis is unavailable.

export interface VoiceOption {
  id: string
  label: string
  nativeLabel: string
  language: string // human-readable language name
  bcp47: string // BCP-47 locale code the browser understands
  voice: string // z-ai TTS voice id (fallback only)
  flag: string
  greeting: string
}

export const VOICES: VoiceOption[] = [
  {
    id: 'en',
    label: 'English (Indian)',
    nativeLabel: 'Indian English',
    language: 'English',
    bcp47: 'en-IN',
    voice: 'tongtong',
    flag: '🇮🇳',
    greeting: "Hi friend! Let's solve this together.",
  },
  {
    id: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    language: 'Hindi',
    bcp47: 'hi-IN',
    voice: 'tongtong',
    flag: '🇮🇳',
    greeting: 'नमस्ते दोस्त! आइए इसे साथ मिलकर हल करें।',
  },
  {
    id: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    language: 'Kannada',
    bcp47: 'kn-IN',
    voice: 'tongtong',
    flag: '🇮🇳',
    greeting: 'ನಮಸ್ಕಾರ ಸ್ನೇಹಿತ! ಒಟ್ಟಿಗೆ ಪರಿಹರಿಸೋಣ.',
  },
]

export function getVoiceById(id: string): VoiceOption {
  return VOICES.find((v) => v.id === id) ?? VOICES[0]
}
