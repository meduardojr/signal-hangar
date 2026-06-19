document.addEventListener('DOMContentLoaded', function(){
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    if(expanded){
      // close
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
    } else {
      // open - use class so CSS can decide if it should be overlay or push content
      nav.classList.add('open');
      nav.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
    }
  });
});
