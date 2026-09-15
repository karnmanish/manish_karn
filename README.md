# Manish Karn — Personal Website

A single-page personal site covering Manish Karn's academic work, the Yog Manish
spiritual/creative practice, published books, and content channels.

## Structure

```
index.html                  — the site (one page, all sections)
assets/
  css/styles.css            — all styles
  js/script.js               — nav, scroll-spy, reader, gallery behaviour
  papers/                    — attached PDFs (technical papers/articles)
  images/                    — page thumbnails + certificate photos
```

Everything is plain HTML/CSS/JS — no build step, no dependencies to install.

## Publish on GitHub Pages

1. Create a new GitHub repository and push this folder's contents to it
   (keep `index.html` at the repository root).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick the branch (usually `main`) and the `/ (root)` folder, then **Save**.
5. GitHub will publish the site at `https://<username>.github.io/<repo-name>/`
   within a minute or two.

## Run it locally

No server is required — just open `index.html` directly in a browser.
If you prefer a local server (some browsers restrict local file access for
certain features), from this folder run:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Adding content later

- **A new paper/article/project card**: copy an existing `.doc-card` block in
  `index.html`, add its PDF to `assets/papers/`, and render a thumbnail with:
  `pdftoppm -f 1 -l 1 -jpeg -r 150 assets/papers/yourfile.pdf assets/images/yourfile-thumb`
  Wire its "Abstract" button to `openAbstractFromEl(title, elementId)` and its
  "Read full paper" button to `toggleInlineReader(this, title, 'assets/papers/yourfile.pdf')`.
- **A new certificate**: add an entry to the `.eca-grid` block, following the
  existing `.eca-card` pattern, with the image in `assets/images/`.
- **Placeholders**: sections and fields marked with the dashed "Placeholder —
  awaiting …" tag are intentionally left for real content — search `ph-tag`
  in `index.html` to find them all.

## Notes

- Fonts (Fraunces, Inter) load from Google Fonts — an internet connection is
  needed for them to render; the page still works offline with fallback fonts.
- PDF embeds use the browser's native PDF viewer (Chrome, Firefox, Edge,
  Safari all support this) — no external library required.
