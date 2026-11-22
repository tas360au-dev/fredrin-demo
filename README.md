# fredrin-demo

Static portfolio built with HTML, CSS and native JavaScript modules. No build step or runtime dependencies.

Run from the project directory:

    python3 -m http.server 8000

Open http://localhost:8000. Use an HTTP server rather than opening index.html directly, because the application uses ES modules.

## Files

- index.html: portfolio content, navigation, project cards and the cat illustration.
- 404.html: unavailable-project page, with a link back to Projects.
- themes.css: shared palette, semantic color tokens and light-theme overrides.
- styles.css: component styles grouped by section, followed by responsive rules and reduced-motion overrides.
- theme.js: early theme initialization, persisted preference and the theme switch. It intentionally loads before styles to apply the saved theme before rendering.
- navigation.js: application entry point that initializes independent UI features.
- js/navigation.js: hash navigation, page title and keyboard shortcuts.
- js/sidebar.js: project-group collapse and project navigation.
- js/account-panels.js: profile and notification panels.
- js/tooltips.js: delayed navigation hints.
- js/cat.js: cat speech rotation and responsive illustration alignment.
- js/mobile-layout.js: mobile drawer, focus handling and project accordions.

## Colors and responsive behavior

All color literals belong in themes.css. Components use semantic tokens; light theme changes their values through html[data-theme="light"]. The selected theme is stored under fredrin-theme in localStorage.

Experience entries, Skills cards and project tags assign shared palette colors with data-color. The mapping is declared once in styles.css. Skills cards also use stable data-category identifiers, and project tags use data-tag identifiers, so moving cards or editing labels does not change their colors.

At widths up to 900px, navigation moves into the drawer and Projects becomes nested vertical accordions. At widths up to 640px, About, Skills and the Experience timeline use a single-column layout. Desktop project cards remain expanded.
