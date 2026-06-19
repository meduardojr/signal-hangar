Mobile-friendly changes added (updated for dashboard title visibility)

Files modified in this commit:
- assets/mobile-first.css    (updated: dashboard-specific responsive rules, nav behavior, accessibility helpers)
- assets/nav-toggle.js       (updated: toggle adds/removes 'open' class instead of inline styles)

What this fixes
- Dashboard items (.dashboard-card or .dashboard-item) will stack on narrow screens and switch to row layout on larger screens.
- The .dashboard-title is set to truncate with ellipsis but on very small screens it will wrap instead of being hidden so you can still read the title.
- Tags, rating, and CTA elements are treated as non-shrinking so they remain visible alongside the title where possible.
- The mobile nav now uses an "open" class so CSS can control whether it overlays or pushes content; default behavior is to push content on small screens to avoid covering the dashboard title.

How to apply these changes site-wide
1. Ensure your dashboard cards use semantic classes: e.g.,

<article class="dashboard-card card">
  <div class="dashboard-header">
    <h3 class="dashboard-title">Very long title that might wrap</h3>
    <div class="dashboard-meta">
      <div class="tags"> <span class="tag">tag1</span> <span class="tag">tag2</span> </div>
      <div class="rating">★ 4.8</div>
      <a class="cta button" href="/buy">Buy</a>
    </div>
  </div>
  <p class="summary">Short summary</p>
</article>

2. If your markup differs, apply equivalent class names or tell me the exact HTML and I will patch templates.

Next steps I can take for you
- If you want, I can update the dashboard template(s) directly to add these classes (provide template paths), and commit those edits to main.
- Or I can open a PR with the template changes for review.

If the issue persists, please paste the dashboard HTML snippet (the card markup) and I will tailor the CSS precisely and commit the fix. 
