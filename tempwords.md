I want you to deeply understand my GitHub repository first.

Repository URL:
https://github.com/CakeorPastry/cakestudio

Check and compare the following branches:
- https://github.com/CakeorPastry/cakestudio/tree/main
- https://github.com/CakeorPastry/cakestudio/tree/compyle-frontend-cleanup-audit

Compare everything relevant between the two, especially folder structures, file naming, CSS and page layouts, testgpt-related files, auth/account/IP systems, and any security-related logic. Specifically inspect what I tried in the compyle-frontend-cleanup-audit branch for testgpt, design changes, and any backend logic attempts. I gave up in that branch because the CSS broke and I couldn’t fix it.

**Important:**  
- Ignore HTML files that are fully independent (do not link any CSS or JS), such as `/nikhil.html`, `/crasherzoner.html`, `/test.html`.  
- Include pages like 404 and 503 HTML files and ensure proper **spacing only**, not a redesign.  

Goals & Requirements:

1) **Frontend**: vanilla HTML, CSS, JS only — no React, TSX, JSX, Angular, Vue, or frameworks.

2) **Folder & file structure standardization**:

Assets:
/assets/videos  
/assets/audios  
/assets/images  
Use **camelCase** for all asset names and folders.

JavaScript & CSS structure example:
/js/  
  global.js          (utilities, popups, notifications, bgcolor/textcolor features, markdown)  
  auth.js            (authentication logic)  
  testgpt.js         (testgpt-specific logic)

CSS:
/css/  
  base.css  
  layout.css  
  buttons.css  
  components.css  
  pages/             (optional per-page CSS files)

**Note:** Adapt structure to the real project; do not copy names blindly.  

3) **Global JS modules / utilities**:

- DOM helpers (selecting elements, toggling classes)  
- copyToClipboard(text)  
- modal/popup creators instead of alert()  
- notification system (timers, progress bars, accept/reject modules)  
- theme toggle (dark/light)  
- background & text color customization with localStorage (cannot save default colors, gradients for user-input, reset/clear, notification on change, debounce notifications)  
- Markdown rendering module: bold text, code blocks, syntax highlighting (Discord/GitHub style)  
- Form validation helpers  
- Navigation helpers (smooth scroll)  
- Error logging  

**JS inclusion notes:**  
- If `script.js` is included normally, all functions should be ready-to-use globally.  
- If we want to use only a single function per page, consider using vanilla JS **module import/export**, but otherwise global inclusion is fine.

4) **Color and theme features**:

- Users can set background & text color. Saved to `localStorage` and applied automatically.  
- Same bg/text as default **cannot be saved**.  
- Default background: gradient; dark mode: gradient + glass effects (not pure dark).  
- Users can reset colors.  
- Input fields show default or current `localStorage` value; reset deletes stored value.  
- User-typed colors are interpreted as gradient variants (e.g., typing RED → reddish gradient).  
- Dark mode still allowed even if user sets custom colors.  
- Description/explanation of this feature should appear in UI.  
- Notifications when colors are applied or changed; include link to reset/change. Debounce notifications appropriately.  

5) **Page structure**:

- Each page/feature in its own folder: e.g., `/testgpt/index.html`, `/testgpt/script.js`, `/testgpt/testgpt.css`  
- HTML pages: lowercase indentation, clear comments (`<!-- METATAGS -->`, `<!-- STYLESHEETS -->`, `<!-- SCRIPTS -->`)  
- Clear, readable classnames & IDs for easy future editing  

6) **Improvement of existing files**:

- `amysteriousworld.html` and other pages: improve headings, text, layout; currently headings are confusing (“heading of which topic?”)  
- 404/503 pages: fix spacing only  
- Inputs: running border effect when focused  

7) **Design & UI**:

- Inspiration: Wickbot, Glassmorphism, Neumorphism, gradients, soft shadows, modern flat/minimal  
- Keep existing Discord button styles intact; create **separate classes for new buttons**  
- Buttons: glow, animated borders, moving gradients, 3D press effects  
- Add a **showcase page** to display buttons, inputs, popups, notifications, colors, markdown, etc.  
- Responsive layouts: flexbox/grid, media queries, **no horizontal overflow**  

8) **JS & UX improvements**:

- Modular global JS for popups, notifications, bgcolor/textcolor system, markdown  
- Popups: notification bars with timers, or confirmation modals from bottom with accept/reject  
- CSS comments for tricky properties; simple properties like width:100% don’t need comments  

9) **Security & backend**:

- Suggest fixes for auth, account, JWT, IP, and security issues  
- Current issue: JWT token sent via URL params and stored in localStorage instead of secure HTTP-only cookie — explain risks and solutions  

10) **TestGPT specifics**:

- Chat-like UI in compyle-frontend-cleanup-audit branch: message history (frontend only)  
- Markdown module should be usable for testGPT messages  
- Check README files to understand intent  

11) **Overall guidance**:

- Clear structure for adding/editing pages  
- Maintain modularity, readability, and comments  
- Fix horizontal overflow and scaling on devices  
- Implement bgcolor/textcolor system with gradients, notifications, popups, reset  
- Default colors not saved  
- Notifications via sleek popups, not alerts, with debounce  
- Ignore independent HTML files that do not link CSS/JS  

