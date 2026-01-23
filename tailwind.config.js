/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Scan all JavaScript files in your project
    './**/*.js',
    './**/*.jsx',
    './examples/**/*.js',
    './components/**/*.js',
    './pages/**/*.js',
    
    // Specifically target OpenScript component patterns
    // This ensures Tailwind scans h.div({ class: "..." }) patterns
  ],
  
  theme: {
    extend: {
      // Custom theme extensions can go here
      colors: {
        // OpenScript brand colors (example)
        'os-primary': '#3490dc',
        'os-secondary': '#ffed4e',
        'os-danger': '#e3342f',
      }
    },
  },
  
  plugins: [
    // Add Tailwind plugins here if needed
    // e.g., @tailwindcss/forms, @tailwindcss/typography
  ],
  
  // JIT mode configuration
  mode: 'jit',
  
  // Safelist classes that might be dynamically generated
  safelist: [
    // Example: preserve utility classes used dynamically
    {
      pattern: /bg-(red|green|blue)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /text-(sm|base|lg|xl|2xl|3xl)/,
    }
  ]
}
