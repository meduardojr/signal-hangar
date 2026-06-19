Mobile-friendly changes added

Files added in this commit:
- assets/mobile-first.css    (core mobile-first styles)
- assets/nav-toggle.js       (small JS to toggle mobile nav)
- assets/inject-viewport.js  (injects meta viewport when missing)

How to apply these changes site-wide
1. Include the CSS in your main HTML template's <head> (right after other styles):

   <link rel="stylesheet" href="/assets/mobile-first.css">

2. Include the JS near the end of <body> or with defer in <head>:

   <script src="/assets/inject-viewport.js" defer></script>
   <script src="/assets/nav-toggle.js" defer></script>

   The inject-viewport script will add a viewport meta tag if your HTML templates don't already include one. Prefer adding the <meta name="viewport"> directly in templates.

3. Update your header/navigation include with the suggested markup (example):

<header class="site-header">
  <div class="container" style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;">
    <a class="brand" href="/">Site</a>
    <button id="nav-toggle" aria-expanded="false" aria-controls="main-nav" class="button" style="background:transparent;color:var(--text);padding:0.4rem;">
      <svg width="24" height="24" aria-hidden="true" focusable="false"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="sr-only">Menu</span>
    </button>
    <nav id="main-nav" class="main-nav" aria-hidden="true" style="position:absolute;left:0;right:0;top:100%;background:var(--bg);display:none;padding:1rem;">
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.5rem;">
        <li><a href="/foo">Foo</a></li>
        <li><a href="/bar">Bar</a></li>
        <li><a href="/baz">Baz</a></li>
      </ul>
    </nav>
  </div>
</header>

Notes & next steps
- I didn't modify existing HTML templates to avoid accidental breaking changes. If you want, I can update header templates directly (tell me the template path) and add the <link> and <script> tags into your base layout and commit those edits.
- After including the CSS/JS, test with Chrome DevTools (mobile emulation) and Lighthouse.

If you'd like I can now: 
A) Update your base template(s) to include these assets and add the meta tag directly (I will need the paths to the template files), or
B) Open a PR instead of committing directly to main (safer), or
C) Revert or tweak any of the files I added.
