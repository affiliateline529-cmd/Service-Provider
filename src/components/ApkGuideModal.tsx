import React, { useState } from 'react';
import {
  X, Download, Smartphone, Terminal, CheckCircle2, ShieldCheck,
  Share2, ArrowRight, Copy, Check, Play
} from 'lucide-react';

interface ApkGuideModalProps {
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Android Package Kit (APK) Guide
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Install "Service Provider" on Android
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5 pt-3 text-xs text-slate-700">
          {/* METHOD 1: Instant PWA Android App */}
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Instant 1-Click Install on Android Phone (PWA)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                Recommended & Fastest
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              You can install this complete Karachi application directly onto your Android phone's home screen right now with zero compilation needed. It runs as a full-screen, standalone Android app without address bars.
            </p>

            <div className="bg-white rounded-xl p-3 border border-emerald-200/80 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-700 shrink-0">Step A:</span>
                <span>Open this link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android mobile.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-700 shrink-0">Step B:</span>
                <span>Tap the <strong>three dots menu (⋮)</strong> at the top right of the browser.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-700 shrink-0">Step C:</span>
                <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium">
              ✓ The "Service Provider" app icon will appear alongside your other Android apps!
            </p>
          </div>

          {/* METHOD 2: Generate Signed Standalone APK using Capacitor */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Compile into a Native Android .APK File (Capacitor)
              </h3>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              To bundle this application into a standalone <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">app-release.apk</code> file for distribution via WhatsApp, Google Drive, or Google Play Store:
            </p>

            {/* Code Commands */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Step 1: Install Capacitor Android Bridge</span>
                  <button
                    onClick={() => copyToClipboard('npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "Service Provider" "pk.serviceprovider.karachi"', 1)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {copiedStep === 1 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === 1 ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl text-[11px] font-mono overflow-x-auto">
{`npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Service Provider" "pk.serviceprovider.karachi"`}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Step 2: Build Web Assets & Add Android Platform</span>
                  <button
                    onClick={() => copyToClipboard('npm run build\nnpx cap add android\nnpx cap copy', 2)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {copiedStep === 2 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === 2 ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl text-[11px] font-mono overflow-x-auto">
{`npm run build
npx cap add android
npx cap copy`}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Step 3: Generate APK via Gradle or Android Studio</span>
                  <button
                    onClick={() => copyToClipboard('cd android && ./gradlew assembleDebug', 3)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {copiedStep === 3 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === 3 ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl text-[11px] font-mono overflow-x-auto">
{`cd android && ./gradlew assembleDebug`}
                </pre>
                <p className="text-[10px] text-slate-500 mt-1">
                  The generated APK file will be located at: <br />
                  <code className="text-blue-900 font-mono">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>
            </div>
          </div>

          {/* Sideloading Instructions */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-900 text-xs flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>How to Install the .APK on an Android Phone</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-amber-800 text-[11px] leading-relaxed">
              <li>Send the compiled <code className="font-mono">app-debug.apk</code> file to your Android phone (via WhatsApp, USB, or Google Drive).</li>
              <li>Tap the file on your phone. If prompted, allow <em>"Install unknown apps"</em> from your file manager or browser settings.</li>
              <li>Tap <strong>Install</strong>. Once complete, launch <strong>Service Provider</strong> from your app drawer!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs transition shadow-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
