import { AssignmentCode } from '@wca/helpers';
import tailwindColors from 'tailwindcss/colors';
import { colors } from './colors';

export type SupportedAssignmentCode =
  | 'competitor'
  | 'staff-scrambler'
  | 'staff-runner'
  | 'staff-judge'
  | 'staff-delegate'
  | 'staff-stagelead'
  | 'staff-announcer'
  | 'staff-showrunner'
  | 'staff-dataentry'
  | 'staff-lunch'
  | 'staff-break'
  | 'staff-core'
  | 'staff-setupteardown'
  | 'staff-other';

export type AssignmentConfig = {
  id: SupportedAssignmentCode;
  /**
   * Tailwind color class.
   */
  color: string;
  colorClass: Record<string, string>;
  key: string;
};

const Assignments: Array<AssignmentConfig> = [
  {
    id: 'competitor',
    color: colors.green,
    colorClass: tailwindColors.green,
    key: 'c',
  },
  {
    id: 'staff-scrambler',
    color: colors.yellow,
    colorClass: tailwindColors.yellow,
    key: 's',
  },
  {
    id: 'staff-runner',
    color: colors.red,
    colorClass: tailwindColors.red,
    key: 'r',
  },
  {
    id: 'staff-judge',
    color: colors.blue,
    colorClass: tailwindColors.blue,
    key: 'j',
  },
  {
    id: 'staff-delegate',
    color: colors.purple,
    colorClass: tailwindColors.purple,
    key: 'd',
  },
  {
    id: 'staff-stagelead',
    color: colors.indigo,
    colorClass: tailwindColors.indigo,
    key: 'l',
  },
  {
    id: 'staff-announcer',
    color: colors.pink,
    colorClass: tailwindColors.pink,
    key: 'a',
  },
  {
    id: 'staff-showrunner',
    color: colors.pink,
    colorClass: tailwindColors.pink,
    key: 'a',
  },
  {
    id: 'staff-dataentry',
    color: colors.grey,
    colorClass: tailwindColors.slate,
    key: 'e',
  },
  {
    id: 'staff-other',
    color: colors.grey,
    colorClass: tailwindColors.slate,
    key: 'o',
  },
  {
    id: 'staff-break',
    color: colors.gray,
    colorClass: tailwindColors.gray,
    key: 'b',
  },
  {
    id: 'staff-lunch',
    color: colors.gray,
    colorClass: tailwindColors.gray,
    key: 'l',
  },
  {
    id: 'staff-setupteardown',
    color: colors.gray,
    colorClass: tailwindColors.gray,
    key: 't',
  },
  {
    id: 'staff-core',
    color: colors.rose,
    colorClass: tailwindColors.rose,
    key: 'c',
  },
];

export const AssignmentsMap = Assignments.reduce(
  (map, assignment) => ({
    ...map,
    [assignment.id]: assignment,
  }),
  {},
) as Record<SupportedAssignmentCode, AssignmentConfig>;

export default Assignments;

export const AssignmentCodeRank: AssignmentCode[] = [
  'staff-scrambler',
  'staff-runner',
  'staff-judge',
  'staff-showrunner',
  'staff-announcer',
  'staff-stagelead',
  'staff-delegate',
  'staff-dataentry',
  'staff-setupteardown',
  'staff-core',
  'staff-break',
  'staff-lunch',
];
