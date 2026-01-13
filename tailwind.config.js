const assignmentColorsPlugin = require('./tailwind/assignment-colors.plugin');

module.exports = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [assignmentColorsPlugin],
};
