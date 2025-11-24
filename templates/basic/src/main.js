/**
 * Main entry point for your OpenScript application
 */

// this must come first to ensure that
// all events the system needs have been
// registered before any component is
// initialized  
import { configureApp } from './ojs.config';
import { router } from 'openscriptjs';
import { setupContexts } from './contexts';
import { setupRoutes } from './routes';

configureApp();
setupContexts();
setupRoutes();

// start the app
router.listen();

console.log('✓ OpenScript app initialized');
