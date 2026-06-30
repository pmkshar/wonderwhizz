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
