/**
 * Global State with Contexts Example
 * Demonstrates best practice: defining states in contexts and passing to components
 */

import { Component, h, context, putContext, state, dom } from "openscriptjs";

// ============================================
// 1. INITIALIZE CONTEXTS AND STATES
// ============================================

// Create contexts
putContext(["global", "page", "user"], "AppContext");

const gc = context("global");
const pc = context("page");
const uc = context("user");

// Initialize states using .states() helper
pc.states({
    pageTitle: "Dashboard",
    loading: false,
    currentView: "home"
});

uc.states({
    username: "Guest",
    isAuthenticated: false,
    preferences: { theme: "light" }
});

gc.states({
    appName: "MyApp",
    version: "1.0.0"
});

// You can also add non-reactive properties
gc.apiUrl = "https://api.example.com";

// ============================================
// 2. COMPONENTS RECEIVE STATE VIA RENDER
// ============================================

class PageHeader extends Component {
    // Receive pageTitle state as parameter
    render(pageTitle, appName, ...args) {
        return h.header(
            { class: "page-header" },
            h.h1(pageTitle.value),  // Access state via .value
            h.p({ class: "app-name" }, appName.value),
            ...args
        );
    }
}

class UserGreeting extends Component {
    // Receive user state
    render(username, ...args) {
        return h.div(
            { class: "greeting" },
            h.p(`Welcome, ${username.value}!`),
            ...args
        );
    }
}

class ThemeToggle extends Component {
    toggleTheme() {
        const current = uc.preferences.value.theme;
        uc.preferences.value = {
            ...uc.preferences.value,
            theme: current === "light" ? "dark" : "light"
        };
    }

    // Receive preferences state
    render(preferences, ...args) {
        return h.button(
            {
                class: "btn btn-secondary",
                listeners: { click: this.toggleTheme }
            },
            `Theme: ${preferences.value.theme}`,
            ...args
        );
    }
}

class LoadingIndicator extends Component {
    // Receive loading state
    render(loading, ...args) {
        if (!loading.value) return null;
        
        return h.div(
            { class: "loading" },
            h.span("Loading..."),
            ...args
        );
    }
}

// ============================================
// 3. MAIN DASHBOARD - PASSES STATES DOWN
// ============================================

class Dashboard extends Component {
    render(...args) {
        return h.div(
            { class: "dashboard" },
            // Pass global states to header
            h.PageHeader(pc.pageTitle, gc.appName),
            
            // Pass user state to greeting
            h.UserGreeting(uc.username),
            
            // Pass preferences to theme toggle
            h.ThemeToggle(uc.preferences),
            
            // Pass loading state
            h.LoadingIndicator(pc.loading),
            
            h.div(
                { class: "content" },
                h.p("Dashboard content goes here")
            ),
            ...args
        );
    }
}

// ============================================
// 4. STATE MANAGEMENT UTILITIES
// ============================================

// Function to update page
function navigateToPage(pageName) {
    pc.loading.value = true;
    pc.pageTitle.value = pageName;
    
    // Simulate async navigation
    setTimeout(() => {
        pc.loading.value = false;
    }, 500);
}

// Function to login
function login(username) {
    uc.username.value = username;
    uc.isAuthenticated.value = true;
}

// ============================================
// 5. USAGE EXAMPLE
// ============================================

function initializeApp() {
    // Add state listeners for logging
    pc.pageTitle.listener((state) => {
        console.log(`Page changed to: ${state.value}`);
    });

    uc.preferences.listener((state) => {
        console.log(`Theme changed to: ${state.value.theme}`);
        // Could apply theme to document here
        document.body.className = `theme-${state.value.theme}`;
    });

    // Render dashboard with special attributes
    const dashboard = h.Dashboard({
        parent: document.getElementById("app"),
        resetParent: true  // Clear existing content
    });

    // Simulate user login after 1 second
    setTimeout(() => {
        login("John Doe");
    }, 1000);

    // Simulate page navigation after 2 seconds
    setTimeout(() => {
        navigateToPage("Profile");
    }, 2000);
}

// Export for use
export { 
    Dashboard, 
    PageHeader, 
    UserGreeting, 
    ThemeToggle,
    LoadingIndicator,
    initializeApp,
    navigateToPage,
    login
};
