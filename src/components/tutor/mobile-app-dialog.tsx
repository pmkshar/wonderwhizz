'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Smartphone, Apple, Code2, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const FLUTTER_SOURCE_URL = '/wonderwhiz-flutter-source.zip' // (optional prebuilt zip — see README)
const GITHUB_REPLACEMENT_TEXT = 'You will find the full Flutter source code under /flutter/wonderwhiz in the project, ready to build for Android & iOS.'

export function MobileAppDialog({ open, onOpenChange }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      toast.success('Copied')
      setTimeout(() => setCopied(null), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            📱 Get the WonderWhiz Mobile App
          </DialogTitle>
          <DialogDescription>
            Same account works everywhere. Log in on web and on the app with the same email & password.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 pt-4 text-sm">
            <p className="text-muted-foreground">
              WonderWhiz is built as a <strong>Flutter</strong> app for both Android and iOS.
              The app talks to the same backend used by this website, so your kid can log in
              with the same email &amp; password and pick up exactly where they left off.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Same Maths / Hindi / Science / Kannada tutors</li>
              <li>Same 8 explanation styles</li>
              <li>Voice-over in English, Hindi &amp; Kannada</li>
              <li>Google login + email/password (synced with web)</li>
              <li>Offline-friendly: last answer stays on the device</li>
            </ul>
            <div className="rounded-xl border border-dashed bg-muted/30 p-3 text-xs">
              <strong>Build it yourself in ~10 minutes.</strong> The Flutter source is in the project at
              <code className="mx-1 rounded bg-background px-1.5 py-0.5">/home/z/my-project/flutter/wonderwhiz</code>
              . Pick the Android or iOS tab for step-by-step build &amp; install instructions.
            </div>
          </TabsContent>

          <TabsContent value="android" className="space-y-3 pt-4 text-sm">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Install <a className="underline" href="https://docs.flutter.dev/get-started/install" target="_blank" rel="noreferrer">Flutter SDK</a> &amp; Android Studio.
              </li>
              <li>
                Open a terminal and build the APK:
                <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
{`cd /home/z/my-project/flutter/wonderwhiz
flutter pub get
flutter build apk --release`}
                </pre>
              </li>
              <li>
                Install the APK on your phone:
                <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
{`adb install build/app/outputs/flutter-apk/app-release.apk`}
                </pre>
                Or copy <code>app-release.apk</code> to your phone and tap to install.
              </li>
              <li>Open the app and log in with your WonderWhiz email &amp; password.</li>
            </ol>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy('flutter build apk --release', 'android-cmd')}
              className="gap-1.5"
            >
              {copied === 'android-cmd' ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy build command
            </Button>
          </TabsContent>

          <TabsContent value="ios" className="space-y-3 pt-4 text-sm">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                On a Mac, install <a className="underline" href="https://docs.flutter.dev/get-started/install" target="_blank" rel="noreferrer">Flutter</a> and Xcode.
              </li>
              <li>
                Build &amp; run on a connected iPhone:
                <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
{`cd /home/z/my-project/flutter/wonderwhiz
flutter pub get
flutter run --release`}
                </pre>
              </li>
              <li>
                For App Store distribution:
                <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
{`flutter build ipa --release
open build/ios/archive/MyApp.xcarchive`}
                </pre>
                Then upload via Xcode → Organizer → Distribute App.
              </li>
              <li>
                For personal device testing without App Store, configure your Apple Developer account in
                <code className="mx-1 rounded bg-background px-1.5 py-0.5">ios/Runner.xcworkspace</code>.
              </li>
            </ol>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy('flutter build ipa --release', 'ios-cmd')}
              className="gap-1.5"
            >
              {copied === 'ios-cmd' ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy build command
            </Button>
          </TabsContent>

          <TabsContent value="source" className="space-y-3 pt-4 text-sm">
            <p className="text-muted-foreground">{GITHUB_REPLACEMENT_TEXT}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="default" className="gap-1.5">
                <a href={FLUTTER_SOURCE_URL} download>
                  <Download className="h-3.5 w-3.5" /> Download Flutter source (.zip)
                </a>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copy('/home/z/my-project/flutter/wonderwhiz', 'src-path')}
                className="gap-1.5"
              >
                {copied === 'src-path' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Code2 className="h-3.5 w-3.5" />
                )}
                Copy source path
              </Button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
{`flutter/
└── wonderwhiz/
    ├── lib/
    │   ├── main.dart
    │   ├── api.dart          # calls /api/tutor & /api/tts
    │   ├── auth.dart         # Google + email/password login
    │   ├── screens/
    │   │   ├── login_screen.dart
    │   │   ├── home_screen.dart
    │   │   └── result_screen.dart
    │   └── widgets/
    │       ├── subject_selector.dart
    │       ├── style_selector.dart
    │       └── voice_player.dart
    ├── android/              # Android build config
    ├── ios/                  # iOS build config
    └── pubspec.yaml`}
            </pre>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5" /> Android 8+
            </span>
            <span className="inline-flex items-center gap-1">
              <Apple className="h-3.5 w-3.5" /> iOS 13+
            </span>
          </div>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
