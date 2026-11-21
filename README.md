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

## 한국어 / English 전환
- 헤더 오른쪽 `EN | KO` 버튼으로 전환됩니다. 선택은 브라우저에 기억되고, 처음 방문자는 영어로 봅니다.
- 번역문은 `assets/js/i18n-ko.js` 한 파일에 있습니다. 왼쪽이 영어 원문(페이지에 있는 그대로), 오른쪽이 한국어입니다.
- 번역을 고치려면 오른쪽 한국어만 수정하세요. 영어 문장을 HTML에서 바꾸면 i18n-ko.js의 왼쪽 키도 똑같이 바꿔야 번역이 적용됩니다.
- 새 페이지를 만들면 main.js 아래에 `i18n-ko.js`, `i18n.js` 스크립트 두 줄을 같이 넣어주세요.