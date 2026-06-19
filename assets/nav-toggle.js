document.addEventListener('DOMContentLoaded', function(){
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    if(expanded){
      nav.style.display = 'none';
      nav.setAttribute('aria-hidden', 'true');
    } else {
      nav.style.display = 'block';
      nav.setAttribute('aria-hidden', 'false');
    }
  });
});
