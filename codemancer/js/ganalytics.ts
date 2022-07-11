// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
function setupGoogleAnalytics() {
  const script = document.createElement('script');
  script.onload = function () {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args){window.dataLayer.push(args);}
    gtag('js', new Date());
    gtag('config', process.env.GOOGLE_ANALYTICS_TOKEN);
  };
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + process.env.GOOGLE_ANALYTICS_TOKEN;
  document.head.appendChild(script);
}

setupGoogleAnalytics();
