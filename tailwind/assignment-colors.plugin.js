/**
 * Tailwind CSS Plugin: Assignment Colors
 *
 * Generates utility classes for WCA competition assignment types.
 * This replaces ~200 lines of repetitive CSS with programmatic generation.
 *
 * Generated classes:
 * - .bg-assignment-{name}        - Full background for pills/badges
 * - .bg-assignment-{name}-muted  - Subtle background with opacity for table cells
 * - .text-assignment-{name}      - Contrasting text color
 * - .border-assignment-{name}    - Border color for accent lines
 * - .table-bg-row-{name}         - Table row background
 * - .table-bg-row-alt-{name}     - Table row alternate (striped) background
 * - .table-bg-row-hover-{name}   - Table row hover background
 */

const plugin = require('tailwindcss/plugin');

/**
 * Complete assignment color definitions
 * Each assignment has all color variants explicitly defined for precise control.
 *
 * Structure:
 * - bg: { light, dark } - Full background colors
 * - bgMuted: { light, dark, lightOpacity, darkOpacity } - Subtle backgrounds
 * - text: { light, dark } - Text colors
 * - border: { light, dark } - Border colors
 * - tableRow: { light, dark, darkOpacity } - Table row backgrounds
 * - tableRowAlt: { light, dark, darkOpacity } - Alternating row backgrounds
 * - tableRowHover: { light, dark } - Row hover backgrounds
 */
const assignmentColorConfig = {
  // Competitor - Green
  competitor: {
    bg: { light: 'green.200', dark: 'green.800' },
    bgMuted: { light: 'green.100', dark: 'green.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'green.800', dark: 'green.200' },
    border: { light: 'green.300', dark: 'green.700' },
    tableRow: { light: 'white', dark: 'green.900', darkOpacity: 30 },
    tableRowAlt: { light: 'green.50', dark: 'green.900', darkOpacity: 50 },
    tableRowHover: { light: 'green.200', dark: 'green.800' },
  },

  // Scrambler - Yellow (needs stronger shades for visibility)
  scrambler: {
    bg: { light: 'yellow.200', dark: 'yellow.700' },
    bgMuted: { light: 'yellow.200', dark: 'yellow.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'yellow.900', dark: 'yellow.200' },
    border: { light: 'yellow.400', dark: 'yellow.600' },
    tableRow: { light: 'white', dark: 'yellow.900', darkOpacity: 30 },
    tableRowAlt: { light: 'yellow.50', dark: 'yellow.900', darkOpacity: 50 },
    tableRowHover: { light: 'yellow.200', dark: 'yellow.700' },
  },

  // Runner - Orange (needs stronger shades for visibility)
  runner: {
    bg: { light: 'orange.300', dark: 'orange.700' },
    bgMuted: { light: 'orange.200', dark: 'orange.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'orange.900', dark: 'orange.200' },
    border: { light: 'orange.400', dark: 'orange.600' },
    tableRow: { light: 'white', dark: 'orange.900', darkOpacity: 30 },
    tableRowAlt: { light: 'orange.50', dark: 'orange.900', darkOpacity: 50 },
    tableRowHover: { light: 'orange.200', dark: 'orange.700' },
  },

  // Judge - Blue
  judge: {
    bg: { light: 'blue.200', dark: 'blue.800' },
    bgMuted: { light: 'blue.100', dark: 'blue.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'blue.800', dark: 'blue.200' },
    border: { light: 'blue.300', dark: 'blue.700' },
    tableRow: { light: 'white', dark: 'blue.900', darkOpacity: 30 },
    tableRowAlt: { light: 'blue.50', dark: 'blue.900', darkOpacity: 50 },
    tableRowHover: { light: 'blue.200', dark: 'blue.800' },
  },

  // Delegate - Purple
  delegate: {
    bg: { light: 'purple.200', dark: 'purple.800' },
    bgMuted: { light: 'purple.100', dark: 'purple.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'purple.800', dark: 'purple.200' },
    border: { light: 'purple.300', dark: 'purple.700' },
    tableRow: { light: 'white', dark: 'purple.900', darkOpacity: 30 },
    tableRowAlt: { light: 'purple.50', dark: 'purple.900', darkOpacity: 50 },
    tableRowHover: { light: 'purple.200', dark: 'purple.800' },
  },

  // Stage Lead - Fuchsia
  stagelead: {
    bg: { light: 'fuchsia.200', dark: 'fuchsia.800' },
    bgMuted: { light: 'fuchsia.100', dark: 'fuchsia.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'fuchsia.800', dark: 'fuchsia.200' },
    border: { light: 'fuchsia.300', dark: 'fuchsia.700' },
    tableRow: { light: 'white', dark: 'fuchsia.900', darkOpacity: 30 },
    tableRowAlt: { light: 'fuchsia.50', dark: 'fuchsia.900', darkOpacity: 50 },
    tableRowHover: { light: 'fuchsia.200', dark: 'fuchsia.800' },
  },

  // Announcer - Violet
  announcer: {
    bg: { light: 'violet.200', dark: 'violet.800' },
    bgMuted: { light: 'violet.100', dark: 'violet.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'violet.800', dark: 'violet.200' },
    border: { light: 'violet.300', dark: 'violet.700' },
    tableRow: { light: 'white', dark: 'violet.900', darkOpacity: 30 },
    tableRowAlt: { light: 'violet.50', dark: 'violet.900', darkOpacity: 50 },
    tableRowHover: { light: 'violet.200', dark: 'violet.800' },
  },

  // Showrunner - Pink
  showrunner: {
    bg: { light: 'pink.200', dark: 'pink.800' },
    bgMuted: { light: 'pink.100', dark: 'pink.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'pink.800', dark: 'pink.200' },
    border: { light: 'pink.300', dark: 'pink.700' },
    tableRow: { light: 'white', dark: 'pink.900', darkOpacity: 30 },
    tableRowAlt: { light: 'pink.50', dark: 'pink.900', darkOpacity: 50 },
    tableRowHover: { light: 'pink.200', dark: 'pink.800' },
  },

  // Data Entry - Cyan
  dataentry: {
    bg: { light: 'cyan.200', dark: 'cyan.800' },
    bgMuted: { light: 'cyan.100', dark: 'cyan.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'cyan.800', dark: 'cyan.200' },
    border: { light: 'cyan.300', dark: 'cyan.700' },
    tableRow: { light: 'white', dark: 'cyan.900', darkOpacity: 30 },
    tableRowAlt: { light: 'cyan.50', dark: 'cyan.900', darkOpacity: 50 },
    tableRowHover: { light: 'cyan.200', dark: 'cyan.800' },
  },

  // Other - Slate
  other: {
    bg: { light: 'slate.200', dark: 'slate.700' },
    bgMuted: { light: 'slate.100', dark: 'slate.800', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'slate.800', dark: 'slate.200' },
    border: { light: 'slate.300', dark: 'slate.600' },
    tableRow: { light: 'white', dark: 'slate.800', darkOpacity: 30 },
    tableRowAlt: { light: 'slate.50', dark: 'slate.800', darkOpacity: 50 },
    tableRowHover: { light: 'slate.200', dark: 'slate.700' },
  },

  // Neutral (break, lunch, setupteardown) - Gray
  neutral: {
    bg: { light: 'gray.200', dark: 'gray.700' },
    bgMuted: { light: 'gray.100', dark: 'gray.800', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'gray.800', dark: 'gray.200' },
    border: { light: 'gray.300', dark: 'gray.600' },
    tableRow: { light: 'white', dark: 'gray.800', darkOpacity: 30 },
    tableRowAlt: { light: 'gray.50', dark: 'gray.800', darkOpacity: 50 },
    tableRowHover: { light: 'gray.200', dark: 'gray.700' },
  },

  // Core Staff - Rose
  core: {
    bg: { light: 'rose.200', dark: 'rose.800' },
    bgMuted: { light: 'rose.100', dark: 'rose.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'rose.800', dark: 'rose.200' },
    border: { light: 'rose.300', dark: 'rose.700' },
    tableRow: { light: 'white', dark: 'rose.900', darkOpacity: 30 },
    tableRowAlt: { light: 'rose.50', dark: 'rose.900', darkOpacity: 50 },
    tableRowHover: { light: 'rose.200', dark: 'rose.800' },
  },

  // Stream - Indigo
  stream: {
    bg: { light: 'indigo.200', dark: 'indigo.800' },
    bgMuted: { light: 'indigo.100', dark: 'indigo.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'indigo.800', dark: 'indigo.200' },
    border: { light: 'indigo.300', dark: 'indigo.700' },
    tableRow: { light: 'white', dark: 'indigo.900', darkOpacity: 30 },
    tableRowAlt: { light: 'indigo.50', dark: 'indigo.900', darkOpacity: 50 },
    tableRowHover: { light: 'indigo.200', dark: 'indigo.800' },
  },

  // Photo - Amber (needs stronger shades for visibility)
  photo: {
    bg: { light: 'amber.300', dark: 'amber.700' },
    bgMuted: { light: 'amber.200', dark: 'amber.900', lightOpacity: 80, darkOpacity: 50 },
    text: { light: 'amber.900', dark: 'amber.200' },
    border: { light: 'amber.400', dark: 'amber.600' },
    tableRow: { light: 'white', dark: 'amber.900', darkOpacity: 30 },
    tableRowAlt: { light: 'amber.50', dark: 'amber.900', darkOpacity: 50 },
    tableRowHover: { light: 'amber.200', dark: 'amber.700' },
  },
};

module.exports = plugin(function ({ addComponents, addUtilities, theme }) {
  const assignmentComponents = {};
  const tableUtilities = {};

  for (const [name, config] of Object.entries(assignmentColorConfig)) {
    // .bg-assignment-{name}
    assignmentComponents[`.bg-assignment-${name}`] = {
      backgroundColor: theme(`colors.${config.bg.light}`),
      '.dark &': {
        backgroundColor: theme(`colors.${config.bg.dark}`),
      },
    };

    // .bg-assignment-{name}-muted
    assignmentComponents[`.bg-assignment-${name}-muted`] = {
      backgroundColor: `rgb(${hexToRgb(theme(`colors.${config.bgMuted.light}`))} / ${config.bgMuted.lightOpacity}%)`,
      '.dark &': {
        backgroundColor: `rgb(${hexToRgb(theme(`colors.${config.bgMuted.dark}`))} / ${config.bgMuted.darkOpacity}%)`,
      },
    };

    // .text-assignment-{name}
    assignmentComponents[`.text-assignment-${name}`] = {
      color: theme(`colors.${config.text.light}`),
      '.dark &': {
        color: theme(`colors.${config.text.dark}`),
      },
    };

    // .border-assignment-{name}
    assignmentComponents[`.border-assignment-${name}`] = {
      borderColor: theme(`colors.${config.border.light}`),
      '.dark &': {
        borderColor: theme(`colors.${config.border.dark}`),
      },
    };

    // .table-bg-row-{name}
    tableUtilities[`.table-bg-row-${name}`] = {
      backgroundColor: theme(`colors.${config.tableRow.light}`),
      '.dark &': {
        backgroundColor: `rgb(${hexToRgb(theme(`colors.${config.tableRow.dark}`))} / ${config.tableRow.darkOpacity}%)`,
      },
    };

    // .table-bg-row-alt-{name}
    tableUtilities[`.table-bg-row-alt-${name}`] = {
      backgroundColor: theme(`colors.${config.tableRowAlt.light}`),
      '.dark &': {
        backgroundColor: `rgb(${hexToRgb(theme(`colors.${config.tableRowAlt.dark}`))} / ${config.tableRowAlt.darkOpacity}%)`,
      },
    };

    // .table-bg-row-hover-{name}
    tableUtilities[`.table-bg-row-hover-${name}`] = {
      backgroundColor: theme(`colors.${config.tableRowHover.light}`),
      '.dark &': {
        backgroundColor: theme(`colors.${config.tableRowHover.dark}`),
      },
    };
  }

  addComponents(assignmentComponents);
  addUtilities(tableUtilities);
});

/**
 * Convert hex color to RGB string for use with opacity
 * @param {string} hex - Hex color value (e.g., '#4ade80' or '4ade80')
 * @returns {string} RGB values as space-separated string (e.g., '74 222 128')
 */
function hexToRgb(hex) {
  if (!hex) return '0 0 0';

  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `${r} ${g} ${b}`;
}
