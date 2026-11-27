# fredrin-demo

Static portfolio built with HTML, CSS and native JavaScript modules. No build step or runtime dependencies.

Run from the project directory:

    python3 -m http.server 8000

Open http://localhost:8000. Use an HTTP server rather than opening index.html directly, because the application uses ES modules.

## Files

- index.html: portfolio content, navigation, project cards and the cat illustration.
- 404.html: generic Page not found page with a Homepage link.
- 403.html: Urban CMS unavailable message with a Back link to Projects; a static page with no server status configuration.
- themes.css: shared palette, semantic color tokens and light-theme overrides.
- styles.css: component styles grouped by section, followed by responsive rules and reduced-motion overrides.
- theme.js: early theme initialization, custom color overrides, persistence and the shared theme API. It loads before styles to apply the saved theme before rendering.
- theme-settings.css: profile settings entry and responsive color-editor dialog.
- js/theme-settings.js: color discovery, live preview, color and opacity editing, save, cancel and reset.
- navigation.js: application entry point that initializes independent UI features.
- js/navigation.js: hash navigation, page title and keyboard shortcuts.
- js/sidebar.js: project-group collapse and project navigation.
- js/sidebar-layout.js: early restoration of desktop sidebar width and collapsed state, pointer and keyboard resizing, and Ctrl+\ toggle.
- js/account-panels.js: profile and notification panels.
- js/notifications.js: per-notification and bulk read actions, persisted in fredrin-read-notifications with cross-tab synchronization.
- js/tooltips.js: delayed navigation hints.
- js/cat.js: cat speech rotation, finale animation control and click handling.
- js/experience.js: reversible height animation for Experience accordions, native summary keyboard behavior and responsive size updates.
- js/mobile-layout.js: mobile drawer, focus handling and project accordions.

## Colors and responsive behavior

All color literals belong in themes.css. Components use semantic tokens; light theme changes their values through html[data-theme="light"]. The selected base theme is stored under fredrin-theme in localStorage. Custom overrides for dark and light are stored separately in the versioned fredrin-custom-themes record. The editor discovers color tokens directly from themes.css; edits preview without writing storage until Save theme. Cancel, Escape and closing the dialog restore the last saved state. Reset colors clears the current base theme overrides; Save theme makes the reset permanent.

Storage updates rebase an open draft without discarding local edits. Saving merges locally changed tokens into the latest stored settings; when the same token was edited in both tabs, the local draft takes precedence on Save. Cat illustration colors and technical SVG mask tokens remain fixed and are excluded from color editing and saved overrides.

The settings dialog enters and exits in 150 ms, respecting reduced-motion preferences. Short viewports scroll the whole dialog. Section keyboard shortcuts are suspended while a modal dialog is open.

Experience entries, Skills cards and project tags assign shared palette colors with data-color. The mapping is declared once in styles.css. Skills cards also use stable data-category identifiers, and project tags use data-tag identifiers, so moving cards or editing labels does not change their colors.

About is the default section when no valid hash is supplied. Direct section links continue to work.

At widths up to 900px, navigation moves into the drawer and Projects becomes nested vertical accordions. Backlog and its card start expanded; other columns start collapsed. User accordion choices are retained when switching between desktop and mobile layouts. At widths up to 640px, About, Skills and the Experience timeline use a single-column layout. Desktop project cards remain expanded.

On desktop, the sidebar content resizes from 180 to 420px, plus a 20px collapse rail. The resize target is 12.5px wide, with a 2px line on its right edge that appears on hover only. Collapsing and expanding animate sidebar width and workspace position together over 200ms; dragging updates immediately. The default total width is 229px; collapsing leaves only the rail and expanding restores the last width. Width and collapsed state persist in `fredrin-sidebar-layout`. The resize separator supports Left/Right (10px), Shift+Left/Right (50px), Home/End and Escape to cancel a drag. Desktop state does not change the mobile drawer.

Sidebar colors use the existing theme editor: `--surface-hover` (Base colors: Hover backgrounds & resize line) controls the resize highlight; `--surface-button-hover` (Surfaces & borders: Sidebar toggle hover) controls the collapse rail hover, including opacity. Sidebar width variables are layout values and are not offered as colors.

The header theme switch crossfades the page over 220ms using View Transitions when available. Initial theme restoration and editor previews remain immediate. Reduced motion and older browsers switch directly; repeated requests keep the latest selected theme.

Experience accordions animate their content height over 220ms, can reverse mid-animation, and adapt to text reflow. Reduced motion opens and closes immediately. Hover shadows match Projects using the existing shadow palette. On mobile the timeline marker aligns with the vertical center of the role icon.
