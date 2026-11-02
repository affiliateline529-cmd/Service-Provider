import React, { useState } from 'react';
import {
  X, Download, Smartphone, Terminal, CheckCircle2, ShieldCheck,
  Share2, ArrowRight, Copy, Check, Play, FileCode, CheckCircle,
  ExternalLink, MessageSquare, AlertTriangle, Sparkles
} from 'lucide-react';

interface ApkGuideModalProps {
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [copiedApkLink, setCopiedApkLink] = useState(false);

  const downloadUrl = `${window.location.origin}/api/download-apk`;

  const handleDownloadApk = () => {
    setDownloading(true);
    setDownloadComplete(false);

    // Trigger browser file download
    const link = document.createElement('a');
    link.href = '/api/download-apk';
    link.download = 'ServiceProvider-Karachi-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      setDownloadComplete(true);
    }, 1500);
  };

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const copyApkDownloadLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopiedApkLink(true);
    setTimeout(() => setCopiedApkLink(false), 2000);
  };

  const shareText = `Download "Service Provider – All Services" Android APK for Karachi, Pakistan!\nFind verified electricians, plumbers, shops & mechanics across Karachi:\n${downloadUrl}`;
  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Android Package Kit (APK)
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                Download Service Provider APK
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
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 pt-3 text-xs text-slate-700">
          {/* PRIMARY DOWNLOAD CARD */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-800 text-white rounded-3xl p-4 sm:p-5 shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Official Android Release</span>
                    <span className="text-[10px] text-emerald-200">Karachi Catalogue Edition v1.0.0</span>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 border border-emerald-300/40 px-2.5 py-0.5 rounded-full font-bold">
                  Verified Safe • APK
                </span>
              </div>

              {/* Package specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/20 p-2.5 rounded-2xl border border-white/10 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-300 block">Package</span>
                  <span className="font-mono font-bold text-white truncate block">pk.serviceprovider.karachi</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 block">Version</span>
                  <span className="font-bold text-white">v1.0.0 (Build 100)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 block">Min. Android</span>
                  <span className="font-bold text-white">Android 8.0+</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 block">Architecture</span>
                  <span className="font-bold text-white">Universal ARM/x86</span>
                </div>
              </div>

              {/* Big Action Download Button */}
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={handleDownloadApk}
                  disabled={downloading}
                  className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-sm shadow-md transition flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-75"
                >
                  <Download className={`w-4 h-4 text-emerald-700 ${downloading ? 'animate-bounce' : ''}`} />
                  <span>
                    {downloading
                      ? 'Downloading APK File...'
                      : downloadComplete
                      ? '✓ Downloaded! Tap to Download Again'
                      : 'Download Android APK Now (.apk)'}
                  </span>
                </button>

                <button
                  onClick={copyApkDownloadLink}
                  className="w-full sm:w-auto py-3 px-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 active:scale-95 shrink-0"
                  title="Copy Direct Download Link"
                >
                  {copiedApkLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedApkLink ? 'Link Copied!' : 'Copy Direct URL'}</span>
                </button>
              </div>

              {downloadComplete && (
                <div className="bg-emerald-500/30 border border-emerald-300/40 p-2.5 rounded-xl text-center text-[11px] text-emerald-100 animate-in fade-in">
                  ✓ <strong>ServiceProvider-Karachi-v1.0.apk</strong> download started! Check your phone's notification bar or downloads folder.
                </div>
              )}
            </div>
          </div>

          {/* SHARE VIA WHATSAPP BUTTON */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-xs">Share APK with Karachi Friends & Family</div>
                <div className="text-[11px] text-slate-500">Send direct WhatsApp link to install on any Android phone</div>
              </div>
            </div>

            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-95 shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>Share APK on WhatsApp</span>
            </a>
          </div>

          {/* 3-STEP EASY INSTALLATION (SIDELOADING) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How to Install the Downloaded APK on Android</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-[11px]">
                  1
                </div>
                <div className="font-bold text-slate-900 text-xs">Tap Download</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tap the green download button above to get the <code className="text-blue-900 font-mono text-[10px]">.apk</code> file.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-[11px]">
                  2
                </div>
                <div className="font-bold text-slate-900 text-xs">Open Notification</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Swipe down your phone screen and tap the downloaded file or open from <strong>My Files / Downloads</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px]">
                  3
                </div>
                <div className="font-bold text-slate-900 text-xs">Tap Install</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tap <strong>Install</strong>. If prompted, toggle <em>"Allow from this source"</em> in Android settings.
                </p>
              </div>
            </div>
          </div>

          {/* METHOD 2: Instant PWA Android App */}
          <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-blue-900 text-xs flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Instant Android Install via Chrome (No APK file needed)</span>
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Fastest
              </span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              On Android, Google Chrome can generate a native WebAPK icon directly to your home screen:
            </p>

            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
              <li>Tap the <strong>three dots (⋮)</strong> menu in Chrome browser at the top right.</li>
              <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li>The official app icon will be pinned to your Android apps drawer!</li>
            </ol>
          </div>

          {/* METHOD 3: Capacitor Source Build Commands */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer Build Command (Capacitor)</span>
              </div>
              <button
                onClick={() => copyToClipboard('npm run build && npx cap add android && npx cap copy && cd android && ./gradlew assembleDebug', 99)}
                className="text-xs text-blue-300 hover:text-white flex items-center space-x-1 font-sans"
              >
                {copiedStep === 99 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedStep === 99 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 overflow-x-auto p-1.5 bg-black/40 rounded-lg">
{`npm run build && npx cap copy
cd android && ./gradlew assembleDebug`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Karachi, Pakistan • Version 1.0.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
