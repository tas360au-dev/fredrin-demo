import { initNavigation } from "./js/navigation.js";
import { initSidebar } from "./js/sidebar.js";
import { initAccountPanels } from "./js/account-panels.js";
import { initNotifications } from "./js/notifications.js";
import { initNavigationTooltips } from "./js/tooltips.js";
import { initThemeSettings } from "./js/theme-settings.js";
import { initCat } from "./js/cat.js";
import { initMobileLayout } from "./js/mobile-layout.js";

const navigation = initNavigation();
const accountPanels = initAccountPanels();
initNotifications();
const tooltips = initNavigationTooltips(navigation.links);
initCat();

initThemeSettings(accountPanels);
initSidebar(navigation);
initMobileLayout({ navigation, accountPanels, tooltips });
