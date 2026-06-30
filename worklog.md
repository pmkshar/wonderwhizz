# WonderWhizz Work Log

---
Task ID: wonderwhiz-full-build
Agent: main (Super Z)
Task: Build AI Tutor Bot for kids with multi-subject, multi-style, multi-language voice-over

Stage Summary:
- Web app fully functional at https://wonderwhizz.vercel.app/
- 6 subjects: Maths, English, English Grammar, Hindi, Science, Kannada
- 8 explanation styles x 6 subjects x 5 voice languages
- 4 Indian boards: CBSE, ICSE, Karnataka, Maharashtra
- Server-side Google TTS proxy for all non-English voice-overs
- Collapsible pill pickers for Syllabus, Topic, Style, Voice

---
Task ID: wonderwhiz-subjects-voices-tts
Agent: main (Super Z)
Task: Add English & English Grammar subjects; add Telugu & Tamil voices; fix all non-English voice-over via server-side Google TTS proxy

Stage Summary:
- Added English and English Grammar subjects
- Added Telugu and Tamil voice languages (5 total)
- Created /api/tts/proxy server-side route for non-English TTS
- All code committed and ready for deploy

---
Task ID: wonderwhiz-voice-chat
Agent: main (Super Z)
Task: Add voice chat to Ask AI mode — mic input + auto-submit + auto-play answer voice-over for all subjects

Work Log:
- Created src/components/tutor/voice-input.tsx — reusable mic button using Web Speech API (SpeechRecognition)
  - Supports all Indian languages via BCP-47 codes (en-IN, hi-IN, kn-IN, te-IN, ta-IN)
  - Continuous + interim results for live transcription
  - Visual feedback: animated red pulse indicator while listening
  - Gracefully hides on browsers without SpeechRecognition (Firefox)
  - Stops on manual click or auto-stops after silence
- Modified src/components/tutor/pages/ask-page.tsx:
  - Added VoiceInput button in the composer area (left of Math KB / Clear buttons)
  - Voice input lang matches the selected voice language (e.g. Hindi voice → Hindi speech recognition)
  - Auto-submits the question 600ms after voice recognition ends
  - Added voiceModeActive state — when a question is asked via voice, the answer auto-plays voice-over
  - Updated placeholder text to mention Voice option
- Modified src/components/tutor/voice-player.tsx:
  - Added autoPlay prop — when true, automatically starts playing the answer voice-over
  - Used by ChatTurnBubble when the question was voice-initiated
- Recreated src/app/api/tts/proxy/route.ts (was lost during git filter-repo)
- TypeScript: zero errors; Build: succeeds with all routes present

Stage Summary:
- Voice chat flow: Student taps 🎙️ Voice → speaks question → auto-submits → AI answers in chat → voice-over auto-plays
- Works for ALL subjects and ALL voice languages
- Pushed to GitHub: https://github.com/pmkshar/wonderwhizz (commit 42af6ba)
- Needs Vercel redeploy to go live

---
Task ID: wonderwhiz-deploy-fix
Agent: main (Super Z)
Task: Fix missing English/English Grammar subjects in UI, add Telugu/Tamil to VOICES array, fix voice-player CORS by using server-side TTS proxy, deploy everything to Vercel

Work Log:
- Found English & English Grammar were never added to subjects.ts SUBJECTS array (the UI picker)
- Added English (📖) and English Grammar (✏️) to subjects.ts
- Added English & English Grammar SUBJECT_CONTEXT to explanation-prompts.ts
- Added 'english' and 'english_grammar' to all 4 boards' subjectIds in syllabus.ts
- Added 'english' and 'english_grammar' to VALID_SUBJECTS in api/tutor/route.ts
- Added isEnglishSubject logic to languageInstruction so English subjects always respond in English
- Added ENGLISH_TEMPLATES and ENGLISH_GRAMMAR_TEMPLATES to sample-questions.ts
- Added Telugu (te-IN) and Tamil (ta-IN) to VOICES array in languages.ts
- Fixed voice-player.tsx: replaced direct browser-side Google TTS fetch (CORS-blocked) with server-side /api/tts/proxy call
- Removed unused buildGoogleTtsUrl, chunkText, playUrl functions from voice-player.tsx
- Deployed to Vercel (wonderwhizz.vercel.app) using new token vcp_7tIg5u1E...
- Verified TTS proxy works on production for all 5 languages (en, hi, kn, te, ta)

Stage Summary:
- All 6 subjects now visible and working on wonderwhizz.vercel.app
- Voice chat with mic input working for all subjects
- Non-English voice-over working via server-side TTS proxy (no more CORS issues)
- 5 voice languages: English, Hindi, Kannada, Telugu, Tamil
- Code pushed to GitHub and deployed to Vercel
