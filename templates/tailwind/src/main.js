/**
 * Main entry point for your OpenScript application
 */

import { Component, h, router, broker } from 'openscriptjs';
import App from './components/App.js';
import './style.css'; // Import Tailwind styles


// Render the app
h.App({
    parent: document.getElementById('app'),
    resetParent: true
});

// Start the router
router.listen();

console.log('✓ OpenScript app initialized');
