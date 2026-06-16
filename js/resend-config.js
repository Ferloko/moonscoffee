/*
 * ╔══════════════════════════════════════════════════════╗
 * ║          Moon's Coffee — Resend Configuration        ║
 * ╠══════════════════════════════════════════════════════╣
 * ║  1. Replace RESEND_API_KEY with your real key from   ║
 * ║     https://resend.com/api-keys                      ║
 * ║                                                      ║
 * ║  2. BUSINESS_EMAIL is where orders arrive.           ║
 * ║                                                      ║
 * ║  3. FROM_EMAIL:                                      ║
 * ║     • Free plan  → use 'onboarding@resend.dev'       ║
 * ║     • Verified domain → 'orders@yourdomain.com'      ║
 * ╚══════════════════════════════════════════════════════╝
 */
window.RESEND_CONFIG = {
  apiKey:        're_7bYdh3pt_JGfXDhzsocbBeB6uxTB9RFzx',             // ← REPLACE WITH YOUR KEY
  businessEmail: 'rrnavarro.fib@gmail.com',  // ← Where orders are received
  fromEmail:     'onboarding@resend.dev',    // ← Sender (free plan default)
  fromName:      "Moon's Coffee Orders",
};
