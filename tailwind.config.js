/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        // CSS-variable mapped families (kept from page configs)
        "body-text": "var(--body-text-font-family)",
        "heading": "var(--heading-font-family)",
        "title": "var(--title-font-family)",
        "small-text": "var(--small-text-font-family)",
        "subheading": "var(--subheading-font-family)",

        // Inter variants (variable-backed)
        "inter-bold": "var(--inter-bold-font-family)",
        "inter-medium": "var(--inter-medium-font-family)",
        "inter-regular": "var(--inter-regular-font-family)",
        "inter-semi-bold": "var(--inter-semi-bold-font-family)",
        "inter-medium-underline": "var(--inter-medium-underline-font-family)",

        // Semantic / Poppins families
        "semantic-heading-1": "var(--semantic-heading-1-font-family)",
        "semantic-heading-2": "var(--semantic-heading-2-font-family)",
        "semantic-heading-3": "var(--semantic-heading-3-font-family)",
        "semantic-input": "var(--semantic-input-font-family)",
        "semantic-label": "var(--semantic-label-font-family)",
        "semantic-button": "var(--semantic-button-font-family)",

        // Poppins variants
        "poppins-bold": "var(--poppins-bold-font-family)",
        "poppins-medium": "var(--poppins-medium-font-family)",
        "poppins-semibold": "var(--poppins-semibold-font-family)",

        // Fallback direct stack (from two page configs) — kept as a useful alias
        "inter": ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
      boxShadow: {
        "button-shadow": "var(--button-shadow)"
      },
      colors: {
        // came from config 22 & 24
        "thapa-red": "#ca0303"
      },
      spacing: {
        // numeric spacings used in original page CSS (kept explicit)
        "3438": "3438px",
        "720": "720px",
        "411.5": "411.5px",
        "397.5": "397.5px",
        "735": "735px"
      }
    }
  },
  plugins: []
};
