import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors when API key is not set
let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM_EMAIL = 'PureTools AI <noreply@puretools.ai>';

interface EmailTemplateProps {
  userName: string;
  language: 'en' | 'de';
}

// Email templates
const templates = {
  welcome: {
    en: (props: EmailTemplateProps) => ({
      subject: 'Welcome to PureTools AI! Your 10 Free Credits Await',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4f46e5; margin: 0;">PureTools AI</h1>
  </div>

  <h2 style="color: #1f2937;">Welcome, ${props.userName}!</h2>

  <p>Thanks for joining PureTools AI! We've added <strong>10 free credits</strong> to your account so you can start using our AI-powered tools right away.</p>

  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
    <p style="color: white; margin: 0 0 8px 0; font-size: 14px;">Your Credit Balance</p>
    <p style="color: white; margin: 0; font-size: 36px; font-weight: bold;">10 Credits</p>
  </div>

  <h3 style="color: #1f2937;">What you can do:</h3>
  <ul style="padding-left: 20px;">
    <li><strong>AI Translator</strong> - Translate documents in seconds</li>
    <li><strong>AI Transcriber</strong> - Convert audio to text</li>
    <li><strong>AI Summarizer</strong> - Get key points from long texts</li>
    <li><strong>21+ Free Tools</strong> - QR codes, image compression, PDF tools & more</li>
  </ul>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://puretools.ai/en/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
  </div>

  <p style="color: #6b7280; font-size: 14px;">Have questions? Just reply to this email - we're happy to help!</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    PureTools AI - Privacy-first tools for everyone<br>
    <a href="https://puretools.ai/en/privacy" style="color: #9ca3af;">Privacy Policy</a> | <a href="https://puretools.ai/en/terms" style="color: #9ca3af;">Terms</a>
  </p>
</body>
</html>
      `,
    }),
    de: (props: EmailTemplateProps) => ({
      subject: 'Willkommen bei PureTools AI! Deine 10 kostenlosen Credits warten',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4f46e5; margin: 0;">PureTools AI</h1>
  </div>

  <h2 style="color: #1f2937;">Willkommen, ${props.userName}!</h2>

  <p>Danke, dass du dich bei PureTools AI angemeldet hast! Wir haben <strong>10 kostenlose Credits</strong> auf dein Konto gutgeschrieben, damit du unsere KI-Tools sofort nutzen kannst.</p>

  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
    <p style="color: white; margin: 0 0 8px 0; font-size: 14px;">Dein Credit-Guthaben</p>
    <p style="color: white; margin: 0; font-size: 36px; font-weight: bold;">10 Credits</p>
  </div>

  <h3 style="color: #1f2937;">Das kannst du tun:</h3>
  <ul style="padding-left: 20px;">
    <li><strong>KI-Übersetzer</strong> - Dokumente in Sekunden übersetzen</li>
    <li><strong>KI-Transkription</strong> - Audio in Text umwandeln</li>
    <li><strong>KI-Zusammenfassung</strong> - Kernpunkte aus langen Texten</li>
    <li><strong>21+ Kostenlose Tools</strong> - QR-Codes, Bildkomprimierung, PDF-Tools & mehr</li>
  </ul>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://puretools.ai/de/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Zum Dashboard</a>
  </div>

  <p style="color: #6b7280; font-size: 14px;">Fragen? Antworte einfach auf diese E-Mail - wir helfen gerne!</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    PureTools AI - Privacy-first Tools für alle<br>
    <a href="https://puretools.ai/de/privacy" style="color: #9ca3af;">Datenschutz</a> | <a href="https://puretools.ai/de/terms" style="color: #9ca3af;">AGB</a>
  </p>
</body>
</html>
      `,
    }),
  },

  day3Tips: {
    en: (props: EmailTemplateProps) => ({
      subject: "Don't miss out! 3 tips to get more from PureTools",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4f46e5; margin: 0;">PureTools AI</h1>
  </div>

  <h2 style="color: #1f2937;">Hey ${props.userName}!</h2>

  <p>It's been 3 days since you joined PureTools. Here are some tips to help you get the most out of our tools:</p>

  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #4f46e5; margin-top: 0;">Tip 1: Try Batch Processing</h3>
    <p style="margin-bottom: 0;">Our Image Compressor lets you compress multiple images at once. Just drag & drop a whole folder!</p>
  </div>

  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #4f46e5; margin-top: 0;">Tip 2: Upload Documents to AI</h3>
    <p style="margin-bottom: 0;">The AI Translator and Summarizer can handle PDF, DOCX, and TXT files directly.</p>
  </div>

  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #4f46e5; margin-top: 0;">Tip 3: Install as App</h3>
    <p style="margin-bottom: 0;">PureTools works offline! Click "Install" in your browser to add it to your home screen.</p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://puretools.ai/en" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Explore All Tools</a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    <a href="https://puretools.ai/en/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
      `,
    }),
    de: (props: EmailTemplateProps) => ({
      subject: 'Nicht verpassen! 3 Tipps für PureTools',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4f46e5; margin: 0;">PureTools AI</h1>
  </div>

  <h2 style="color: #1f2937;">Hey ${props.userName}!</h2>

  <p>Es sind 3 Tage vergangen seit du dich angemeldet hast. Hier sind einige Tipps, um das Beste aus unseren Tools herauszuholen:</p>

  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #4f46e5; margin-top: 0;">Tipp 1: Stapelverarbeitung nutzen</h3>
    <p style="margin-bottom: 0;">Unser Bild-Kompressor kann mehrere Bilder auf einmal verarbeiten. Einfach einen ganzen Ordner per Drag & Drop!</p>
  </div>

  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #4f46e5; margin-top: 0;">Tipp 2: Dokumente hochladen</h3>
    <p style="margin-bottom: 0;">Der KI-Übersetzer und die Zusammenfassung können PDF, DOCX und TXT direkt verarbeiten.</p>
  </div>

  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #4f46e5; margin-top: 0;">Tipp 3: Als App installieren</h3>
    <p style="margin-bottom: 0;">PureTools funktioniert auch offline! Klicke auf "Installieren" im Browser.</p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://puretools.ai/de" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Alle Tools entdecken</a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    <a href="https://puretools.ai/de/unsubscribe" style="color: #9ca3af;">Abmelden</a>
  </p>
</body>
</html>
      `,
    }),
  },

  day7Reminder: {
    en: (props: EmailTemplateProps) => ({
      subject: 'Your credits are waiting! Use them before they expire',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4f46e5; margin: 0;">PureTools AI</h1>
  </div>

  <h2 style="color: #1f2937;">Hey ${props.userName}!</h2>

  <p>Just a friendly reminder - you still have <strong>free credits</strong> in your account!</p>

  <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="color: #92400e; margin: 0; font-weight: 600;">Your credits will expire in 23 days. Use them now!</p>
  </div>

  <h3 style="color: #1f2937;">Most popular this week:</h3>
  <ul style="padding-left: 20px;">
    <li>AI Document Translator - Perfect for multilingual docs</li>
    <li>Image Compressor - Reduce file size by up to 90%</li>
    <li>QR Code Generator - With custom colors and logos</li>
  </ul>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://puretools.ai/en/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Use My Credits</a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    <a href="https://puretools.ai/en/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
      `,
    }),
    de: (props: EmailTemplateProps) => ({
      subject: 'Deine Credits warten! Nutze sie bevor sie verfallen',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4f46e5; margin: 0;">PureTools AI</h1>
  </div>

  <h2 style="color: #1f2937;">Hey ${props.userName}!</h2>

  <p>Nur eine freundliche Erinnerung - du hast noch <strong>kostenlose Credits</strong> auf deinem Konto!</p>

  <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="color: #92400e; margin: 0; font-weight: 600;">Deine Credits verfallen in 23 Tagen. Nutze sie jetzt!</p>
  </div>

  <h3 style="color: #1f2937;">Am beliebtesten diese Woche:</h3>
  <ul style="padding-left: 20px;">
    <li>KI-Übersetzer - Perfekt für mehrsprachige Dokumente</li>
    <li>Bild-Kompressor - Dateigröße um bis zu 90% reduzieren</li>
    <li>QR-Code Generator - Mit eigenen Farben und Logos</li>
  </ul>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://puretools.ai/de/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Meine Credits nutzen</a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    <a href="https://puretools.ai/de/unsubscribe" style="color: #9ca3af;">Abmelden</a>
  </p>
</body>
</html>
      `,
    }),
  },
};

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  language: 'en' | 'de' = 'en'
) {
  const resend = getResend();
  if (!resend) {
    console.log('RESEND_API_KEY not set, skipping email');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const template = templates.welcome[language]({ userName, language });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log('Welcome email sent:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send day 3 tips email
 */
export async function sendDay3TipsEmail(
  to: string,
  userName: string,
  language: 'en' | 'de' = 'en'
) {
  const resend = getResend();
  if (!resend) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    const template = templates.day3Tips[language]({ userName, language });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send day 7 reminder email
 */
export async function sendDay7ReminderEmail(
  to: string,
  userName: string,
  language: 'en' | 'de' = 'en'
) {
  const resend = getResend();
  if (!resend) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    const template = templates.day7Reminder[language]({ userName, language });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return { success: false, error: 'Failed to send email' };
  }
}
