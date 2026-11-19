const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

export function initAnalytics() {
  if (!GA_ID || typeof document === "undefined") return;

  if (document.getElementById("ga4-script")) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", name, params);
}

export function isAnalyticsEnabled() {
  return Boolean(GA_ID);
}
