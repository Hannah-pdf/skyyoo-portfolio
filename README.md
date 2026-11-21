# SKY YOO — Portfolio site

Static HTML/CSS/JS site rebuilt from the Framer portfolio and the Figma case studies.
No build step: open the files, edit, and publish.

## Structure

```
index.html                  Home (stickers, big title, project cards, roles, story)
about.html                  About
contact.html                Contact
casestudies/index.html      Case study list
casestudies/korailtalk.html
casestudies/heartpath.html
casestudies/forest-watershed-map.html
assets/css/style.css        Base styles + case-study layout (tokens at the top in :root)
assets/css/pearl.css        Live-site look: header, footer, Home, About, Contact, list
assets/js/main.js           Smooth scroll, reveal animation, draggable stickers, side nav
assets/img/                 Images exported from Figma
```

## Editing

- **Text**: open the page's `.html` file and change the words between the tags.
- **Images**: replace the file in `assets/img/...` with one of the same name, or change the `src`.
- **Colors / fonts**: edit the variables at the top of `assets/css/style.css`.
- The header and footer are copied into every page — change all of them if you edit one.

## Still to fill in (search for `data-todo`)

- `resume-link` — Resume PDF link
- `linkedin`, `dribbble` — footer and contact links (email is already set)
- `korail-prototype`, `heartpath-prototype` — Figma prototype links

## Preview locally

```
python -m http.server 5173
```
then open http://localhost:5173

## Publish on GitHub Pages

1. Create a new repository on GitHub (for example `portfolio`).
2. Upload everything in this folder (or `git push`).
3. Repository → Settings → Pages → Source: *Deploy from a branch*, Branch: `main` / root.
4. The site appears at `https://<your-username>.github.io/portfolio/`.
