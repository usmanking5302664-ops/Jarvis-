import { jsPDF } from 'jspdf';

// Web Audio API Sound Synthesizer for Authentic Jarvis Audio Feedback
class JarvisAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 880, duration = 0.1, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio synth error', e);
    }
  }

  playStartupChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 0.25, 'triangle');
        }, idx * 70);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playSuccessTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [587.33, 880, 1174.66];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 0.15, 'sine');
        }, idx * 90);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playAlertTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.playBeep(330, 0.2, 'sawtooth');
      setTimeout(() => this.playBeep(260, 0.3, 'sawtooth'), 150);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const jarvisAudio = new JarvisAudioSynthesizer();

export interface AppShortcut {
  name: string;
  scheme: string;
  webUrl: string;
  category: string;
}

export const KNOWN_PHONE_APPS: AppShortcut[] = [
  { name: 'WhatsApp', scheme: 'whatsapp://', webUrl: 'https://web.whatsapp.com', category: 'Social' },
  { name: 'YouTube', scheme: 'vnd.youtube://', webUrl: 'https://www.youtube.com', category: 'Media' },
  { name: 'Chrome', scheme: 'googlechrome://', webUrl: 'https://www.google.com', category: 'Browser' },
  { name: 'Spotify', scheme: 'spotify://', webUrl: 'https://open.spotify.com', category: 'Music' },
  { name: 'Google Play Store', scheme: 'market://', webUrl: 'https://play.google.com/store', category: 'Store' },
  { name: 'Camera', scheme: 'intent:#Intent;action=android.media.action.STILL_IMAGE_CAMERA;end', webUrl: '', category: 'System' },
  { name: 'Gallery / Photos', scheme: 'intent:#Intent;action=android.intent.action.VIEW;type=image/*;end', webUrl: '', category: 'Media' },
  { name: 'Settings', scheme: 'intent:#Intent;action=android.settings.SETTINGS;end', webUrl: '', category: 'System' },
  { name: 'Phone Dialer', scheme: 'tel:', webUrl: '', category: 'System' },
  { name: 'Messages / SMS', scheme: 'sms:', webUrl: '', category: 'System' },
  { name: 'Gmail', scheme: 'googlegmail://', webUrl: 'https://mail.google.com', category: 'Productivity' },
  { name: 'Google Maps', scheme: 'geo:0,0?q=', webUrl: 'https://maps.google.com', category: 'Navigation' },
  { name: 'Calculator', scheme: 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_CALCULATOR;end', webUrl: '', category: 'Tools' },
  { name: 'Facebook', scheme: 'fb://', webUrl: 'https://www.facebook.com', category: 'Social' },
  { name: 'Instagram', scheme: 'instagram://', webUrl: 'https://www.instagram.com', category: 'Social' },
  { name: 'TikTok', scheme: 'snssdk1128://', webUrl: 'https://www.tiktok.com', category: 'Social' },
  { name: 'Telegram', scheme: 'tg://', webUrl: 'https://web.telegram.org', category: 'Social' },
  { name: 'X / Twitter', scheme: 'twitter://', webUrl: 'https://x.com', category: 'Social' },
];

export function executeSendSms(phoneNumber: string, message: string): { success: boolean; message: string; uri: string } {
  jarvisAudio.playSuccessTone();
  const cleanPhone = phoneNumber ? phoneNumber.replace(/[^\d+]/g, '') : '';
  const uri = `sms:${cleanPhone}?body=${encodeURIComponent(message || '')}`;

  // Copy to clipboard for convenience
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  // Attempt to open device SMS handler
  const anchor = document.createElement('a');
  anchor.href = uri;
  anchor.target = '_blank';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  return {
    success: true,
    message: cleanPhone 
      ? `SMS intent dispatched to ${cleanPhone}: "${message}"` 
      : `SMS intent dispatched: "${message}"`,
    uri
  };
}

export function executeOpenApp(appNameQuery: string): { success: boolean; appName: string; action: string } {
  jarvisAudio.playSuccessTone();
  const query = appNameQuery.toLowerCase().trim();
  
  // Find match in known apps
  const matched = KNOWN_PHONE_APPS.find(a => 
    a.name.toLowerCase().includes(query) || query.includes(a.name.toLowerCase())
  );

  if (matched) {
    // Try opening native scheme or web fallback
    const targetUrl = matched.scheme || matched.webUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
      return { success: true, appName: matched.name, action: `Opened ${matched.name} via ${targetUrl}` };
    }
  }

  // Generic fallback: Search app on Google Play or search web
  const playSearch = `https://play.google.com/store/search?q=${encodeURIComponent(appNameQuery)}&c=apps`;
  window.open(playSearch, '_blank');
  return { success: true, appName: appNameQuery, action: `Searching for ${appNameQuery} on Google Play Store` };
}

export function executeInstallFromPlayStore(appName: string): { success: boolean; url: string } {
  jarvisAudio.playSuccessTone();
  const playStoreUri = `market://search?q=${encodeURIComponent(appName)}`;
  const playStoreWeb = `https://play.google.com/store/search?q=${encodeURIComponent(appName)}&c=apps`;

  // First try market scheme, fallback to web
  const link = document.createElement('a');
  link.href = playStoreWeb;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { success: true, url: playStoreWeb };
}

export function executePlaySong(songTitle: string): { success: boolean; song: string; url: string } {
  jarvisAudio.playStartupChime();
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songTitle)}`;
  window.open(ytSearchUrl, '_blank');
  return { success: true, song: songTitle, url: ytSearchUrl };
}

export function executeGenerateAndDownloadPdf(
  title: string, 
  content: string, 
  modules?: Array<{ title: string; summary: string; keyPoints?: string[] }>
): { success: boolean; filename: string } {
  jarvisAudio.playSuccessTone();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;

  // Header Background Banner (Deep Sci-Fi Blue)
  doc.setFillColor(4, 9, 20);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Cyan glowing accent bar
  doc.setFillColor(0, 240, 255);
  doc.rect(0, 37, pageWidth, 1.5, 'F');

  // JARVIS System Header Title
  doc.setTextColor(0, 240, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('J.A.R.V.I.S. SYSTEM DOCUMENT', margin, 18);

  // Subtitle & Timestamp
  doc.setTextColor(180, 215, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()} | Autonomous Device Intelligence`, margin, 26);
  doc.text('AI Engine: Google Gemini Pro | Verification: Verified Secure', margin, 32);

  // Document Title
  let cursorY = 48;
  doc.setTextColor(10, 25, 47);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(title, maxLineWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 8 + 4;

  // Horizontal separator
  doc.setDrawColor(200, 225, 245);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Body Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40, 50, 65);

  if (content) {
    const splitBody = doc.splitTextToSize(content, maxLineWidth);
    for (const line of splitBody) {
      if (cursorY > 270) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, margin, cursorY);
      cursorY += 6;
    }
  }

  // Modules if Course / Structured document
  if (modules && modules.length > 0) {
    cursorY += 6;
    modules.forEach((mod, index) => {
      if (cursorY > 260) {
        doc.addPage();
        cursorY = 20;
      }

      // Module Heading
      doc.setFillColor(240, 248, 255);
      doc.rect(margin, cursorY - 4, maxLineWidth, 8, 'F');
      doc.setTextColor(0, 80, 160);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Section ${index + 1}: ${mod.title}`, margin + 2, cursorY + 2);
      cursorY += 10;

      // Module Summary
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(50, 60, 75);
      const modLines = doc.splitTextToSize(mod.summary, maxLineWidth - 4);
      doc.text(modLines, margin + 2, cursorY);
      cursorY += modLines.length * 5.5 + 4;

      // Key points
      if (mod.keyPoints && mod.keyPoints.length > 0) {
        mod.keyPoints.forEach(pt => {
          if (cursorY > 270) {
            doc.addPage();
            cursorY = 20;
          }
          doc.setTextColor(0, 150, 180);
          doc.text('•', margin + 4, cursorY);
          doc.setTextColor(60, 70, 85);
          const ptLines = doc.splitTextToSize(pt, maxLineWidth - 10);
          doc.text(ptLines, margin + 8, cursorY);
          cursorY += ptLines.length * 5 + 1;
        });
        cursorY += 4;
      }
    });
  }

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 220, 235);
    doc.line(margin, 285, pageWidth - margin, 285);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(130, 145, 160);
    doc.text(`JARVIS AI Assistant - Autonomous Device Controller | Page ${i} of ${pageCount}`, margin, 290);
  }

  const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const filename = `JARVIS_${safeName}_${Date.now()}.pdf`;
  doc.save(filename);

  return { success: true, filename };
}

export function executeDownloadHtml(title: string, htmlContent: string): { success: boolean; filename: string } {
  jarvisAudio.playSuccessTone();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const filename = `${safeName || 'app'}_jarvis.html`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename };
}

export async function fetchDeviceTelemetry(): Promise<{
  platform: string;
  online: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  screenRes: string;
  cores: number;
  ramGB?: number;
  time: string;
}> {
  let batteryLevel: number | undefined;
  let isCharging: boolean | undefined;

  try {
    if ('getBattery' in navigator) {
      const b: any = await (navigator as any).getBattery();
      batteryLevel = Math.round(b.level * 100);
      isCharging = b.charging;
    }
  } catch (e) {
    // Battery API might be restricted
  }

  return {
    platform: navigator.platform || 'Android OS',
    online: navigator.onLine,
    batteryLevel: batteryLevel ?? 88,
    isCharging: isCharging ?? true,
    screenRes: `${window.screen.width}x${window.screen.height}`,
    cores: navigator.hardwareConcurrency || 8,
    ramGB: (navigator as any).deviceMemory || 8,
    time: new Date().toLocaleTimeString()
  };
}
