# Manish Karn — Personal Website

A single-page personal site: résumé timeline, research, teaching experience,
Yog M Creations (YouTube channels + books), built as a static site
(HTML + CSS + JS, no build step required).

## Files

- `index.html` — page structure and content
- `styles.css` — all styling
- `data.js` — channel/playlist/video data (loaded before `script.js`)
- `script.js` — interactivity (nav, timeline tree animation, media playback, etc.)

## Publish on GitHub Pages

1. **Create a new repository** on GitHub (e.g. `manish-karn-site`). It can be
   public or private — GitHub Pages needs a public repo unless you're on a
   paid plan that supports Pages for private repos.

2. **Upload these four files** to the repository root — `index.html`,
   `styles.css`, `data.js`, `script.js` — either by dragging them into the
   GitHub web UI ("Add file → Upload files") or via git:

   ```bash
   git init
   git add index.html styles.css data.js script.js README.md
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. **Enable Pages**: in the repository, go to **Settings → Pages**. Under
   "Build and deployment", set **Source** to **Deploy from a branch**, pick
   the **main** branch and **/ (root)** folder, then **Save**.

4. GitHub will publish the site at:

   ```
   https://<your-username>.github.io/<repo-name>/
   ```

   It can take a minute or two for the first deploy to go live. Every time
   you push a change to `main`, the site rebuilds automatically.

5. **Optional — custom domain**: if you own a domain, add a `CNAME` file
   to the repo root containing just your domain (e.g. `manishkarn.com`),
   then point your domain's DNS at GitHub Pages per
   [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Notes

- Everything runs client-side — no server or database needed, so GitHub
  Pages (which only serves static files) is a good fit.
- Fonts load from Google Fonts and YouTube embeds load from YouTube at
  runtime — both need the visitor to have normal internet access, same as
  any other site.
- To update channel/video/playlist data later, edit `data.js` — it's a
  single `CHANNEL_INFO` object keyed by channel (`bhavatu`, `storykahani`,
  and `mysteries` once you have that channel's details).
