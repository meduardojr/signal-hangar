// Inject a viewport meta tag if the HTML doesn't include one (useful when templates are hard to edit)
(function(){
  if (typeof document === 'undefined') return;
  function ensureViewport(){
    if (!document.querySelector('meta[name="viewport"]')) {
      var m = document.createElement('meta');
      m.name = 'viewport';
      m.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
      document.head.appendChild(m);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureViewport); else ensureViewport();
})();
