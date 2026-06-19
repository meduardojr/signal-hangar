Updated: removed average rating display and ensured CTA buttons are visible by default.

Changes in this commit:
- assets/mobile-first.css: added CSS to hide the .rating element and force .cta buttons to be visible (overrides hover/focus-only behavior).

Notes:
- I hid the rating via CSS (.rating { display:none !important; }) so templates aren't changed and nothing breaks if other views rely on the element. If you want the rating markup removed entirely from templates, provide the template path(s) and I will remove them.
- I forced CTAs visible by default using strong CSS rules. If your app previously toggled visibility via JavaScript, the JS may still toggle classes; this CSS will keep buttons visible. If you prefer restoring original behavior for desktop only, I can scope these overrides to mobile breakpoints only.

Next steps:
- Test mobile dashboard: titles, tags and CTAs should now be visible and tappable by default.
- Tell me if you want the rating markup removed from templates — I can edit them and commit the change.
