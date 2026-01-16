import tailwindColors from 'tailwindcss/colors';

// Tailwind colors [400]
export const colors: Record<string, string> = {
  neutral: tailwindColors.neutral[400],
  slate: tailwindColors.slate[400],
  zinc: tailwindColors.zinc[400],
  stone: tailwindColors.stone[400],
  red: tailwindColors.red[400],
  orange: tailwindColors.orange[400],
  amber: tailwindColors.amber[400],
  blue: tailwindColors.blue[400],
  green: tailwindColors.green[400],
  yellow: tailwindColors.yellow[400],
  purple: tailwindColors.purple[400],
  indigo: tailwindColors.indigo[400],
  pink: tailwindColors.pink[400],
  violet: tailwindColors.violet[400],
  gray: tailwindColors.gray[400],
  rose: tailwindColors.rose[400],
};

/**
 * Assignment color class mapping
 * Maps assignment codes to their CSS token class names (defined in _tokens.scss)
 * Use these instead of inline styles for proper dark mode support
 */
export type AssignmentColorClasses = {
  bg: string;
  bgMuted: string;
  text: string;
  border: string;
  tableRow: string;
  tableRowAlt: string;
  tableRowHover: string;
};

export const assignmentColorClasses: Record<string, AssignmentColorClasses> = {
  competitor: {
    bg: 'bg-assignment-competitor',
    bgMuted: 'bg-assignment-competitor-muted',
    text: 'text-assignment-competitor',
    border: 'border-assignment-competitor',
    tableRow: 'table-bg-row-competitor',
    tableRowAlt: 'table-bg-row-alt-competitor',
    tableRowHover: 'table-bg-row-hover-competitor',
  },
  'staff-scrambler': {
    bg: 'bg-assignment-scrambler',
    bgMuted: 'bg-assignment-scrambler-muted',
    text: 'text-assignment-scrambler',
    border: 'border-assignment-scrambler',
    tableRow: 'table-bg-row-scrambler',
    tableRowAlt: 'table-bg-row-alt-scrambler',
    tableRowHover: 'table-bg-row-hover-scrambler',
  },
  'staff-runner': {
    bg: 'bg-assignment-runner',
    bgMuted: 'bg-assignment-runner-muted',
    text: 'text-assignment-runner',
    border: 'border-assignment-runner',
    tableRow: 'table-bg-row-runner',
    tableRowAlt: 'table-bg-row-alt-runner',
    tableRowHover: 'table-bg-row-hover-runner',
  },
  'staff-judge': {
    bg: 'bg-assignment-judge',
    bgMuted: 'bg-assignment-judge-muted',
    text: 'text-assignment-judge',
    border: 'border-assignment-judge',
    tableRow: 'table-bg-row-judge',
    tableRowAlt: 'table-bg-row-alt-judge',
    tableRowHover: 'table-bg-row-hover-judge',
  },
  'staff-delegate': {
    bg: 'bg-assignment-delegate',
    bgMuted: 'bg-assignment-delegate-muted',
    text: 'text-assignment-delegate',
    border: 'border-assignment-delegate',
    tableRow: 'table-bg-row-delegate',
    tableRowAlt: 'table-bg-row-alt-delegate',
    tableRowHover: 'table-bg-row-hover-delegate',
  },
  'staff-stagelead': {
    bg: 'bg-assignment-stagelead',
    bgMuted: 'bg-assignment-stagelead-muted',
    text: 'text-assignment-stagelead',
    border: 'border-assignment-stagelead',
    tableRow: 'table-bg-row-stagelead',
    tableRowAlt: 'table-bg-row-alt-stagelead',
    tableRowHover: 'table-bg-row-hover-stagelead',
  },
  'staff-announcer': {
    bg: 'bg-assignment-announcer',
    bgMuted: 'bg-assignment-announcer-muted',
    text: 'text-assignment-announcer',
    border: 'border-assignment-announcer',
    tableRow: 'table-bg-row-announcer',
    tableRowAlt: 'table-bg-row-alt-announcer',
    tableRowHover: 'table-bg-row-hover-announcer',
  },
  'staff-showrunner': {
    bg: 'bg-assignment-showrunner',
    bgMuted: 'bg-assignment-showrunner-muted',
    text: 'text-assignment-showrunner',
    border: 'border-assignment-showrunner',
    tableRow: 'table-bg-row-showrunner',
    tableRowAlt: 'table-bg-row-alt-showrunner',
    tableRowHover: 'table-bg-row-hover-showrunner',
  },
  'staff-dataentry': {
    bg: 'bg-assignment-dataentry',
    bgMuted: 'bg-assignment-dataentry-muted',
    text: 'text-assignment-dataentry',
    border: 'border-assignment-dataentry',
    tableRow: 'table-bg-row-dataentry',
    tableRowAlt: 'table-bg-row-alt-dataentry',
    tableRowHover: 'table-bg-row-hover-dataentry',
  },
  'staff-other': {
    bg: 'bg-assignment-other',
    bgMuted: 'bg-assignment-other-muted',
    text: 'text-assignment-other',
    border: 'border-assignment-other',
    tableRow: 'table-bg-row-other',
    tableRowAlt: 'table-bg-row-alt-other',
    tableRowHover: 'table-bg-row-hover-other',
  },
  'staff-break': {
    bg: 'bg-assignment-neutral',
    bgMuted: 'bg-assignment-neutral-muted',
    text: 'text-assignment-neutral',
    border: 'border-assignment-neutral',
    tableRow: 'table-bg-row-neutral',
    tableRowAlt: 'table-bg-row-alt-neutral',
    tableRowHover: 'table-bg-row-hover-neutral',
  },
  'staff-lunch': {
    bg: 'bg-assignment-neutral',
    bgMuted: 'bg-assignment-neutral-muted',
    text: 'text-assignment-neutral',
    border: 'border-assignment-neutral',
    tableRow: 'table-bg-row-neutral',
    tableRowAlt: 'table-bg-row-alt-neutral',
    tableRowHover: 'table-bg-row-hover-neutral',
  },
  'staff-setupteardown': {
    bg: 'bg-assignment-neutral',
    bgMuted: 'bg-assignment-neutral-muted',
    text: 'text-assignment-neutral',
    border: 'border-assignment-neutral',
    tableRow: 'table-bg-row-neutral',
    tableRowAlt: 'table-bg-row-alt-neutral',
    tableRowHover: 'table-bg-row-hover-neutral',
  },
  'staff-core': {
    bg: 'bg-assignment-core',
    bgMuted: 'bg-assignment-core-muted',
    text: 'text-assignment-core',
    border: 'border-assignment-core',
    tableRow: 'table-bg-row-core',
    tableRowAlt: 'table-bg-row-alt-core',
    tableRowHover: 'table-bg-row-hover-core',
  },
  'staff-stream': {
    bg: 'bg-assignment-stream',
    bgMuted: 'bg-assignment-stream-muted',
    text: 'text-assignment-stream',
    border: 'border-assignment-stream',
    tableRow: 'table-bg-row-stream',
    tableRowAlt: 'table-bg-row-alt-stream',
    tableRowHover: 'table-bg-row-hover-stream',
  },
  'staff-photo': {
    bg: 'bg-assignment-photo',
    bgMuted: 'bg-assignment-photo-muted',
    text: 'text-assignment-photo',
    border: 'border-assignment-photo',
    tableRow: 'table-bg-row-photo',
    tableRowAlt: 'table-bg-row-alt-photo',
    tableRowHover: 'table-bg-row-hover-photo',
  },
};

/**
 * Get assignment color classes for a given assignment code
 * Falls back to 'other' styling for unknown assignment codes
 */
export function getAssignmentColorClasses(assignmentCode: string): AssignmentColorClasses {
  // Handle judge variants (e.g., 'staff-judge-1', 'staff-judge-2')
  if (assignmentCode.match(/judge/i)) {
    return assignmentColorClasses['staff-judge'];
  }
  return assignmentColorClasses[assignmentCode] ?? assignmentColorClasses['staff-other'];
}
