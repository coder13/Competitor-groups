import tailwindColors from 'tailwindcss/colors';
import { AssignmentCode } from '@wca/helpers';
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
  name: string;
  plural: string;
  verb: string;
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
    name: 'Competitor',
    plural: 'Competitors',
    verb: 'Competing',
    color: colors.green,
    colorClass: tailwindColors.green,
    key: 'c',
  },
  {
    id: 'staff-scrambler',
    name: 'Scrambler',
    plural: 'Scramblers',
    verb: 'Scrambling',
    color: colors.yellow,
    colorClass: tailwindColors.yellow,
    key: 's',
  },
  {
    id: 'staff-runner',
    name: 'Runner',
    plural: 'Runners',
    verb: 'Running',
    color: colors.red,
    colorClass: tailwindColors.red,
    key: 'r',
  },
  {
    id: 'staff-judge',
    name: 'Judge',
    plural: 'Judges',
    verb: 'Judging',
    color: colors.blue,
    colorClass: tailwindColors.blue,
    key: 'j',
  },
  {
    id: 'staff-delegate',
    name: 'Delegate',
    plural: 'Delegates',
    verb: 'Delegating',
    color: colors.purple,
    colorClass: tailwindColors.purple,
    key: 'd',
  },
  {
    id: 'staff-stagelead',
    name: 'Stage Lead',
    plural: 'Stage Leads',
    verb: 'In Charge',
    color: colors.indigo,
    colorClass: tailwindColors.indigo,
    key: 'l',
  },
  {
    id: 'staff-announcer',
    name: 'Announcer',
    plural: 'Announcers',
    verb: 'Announcing',
    color: colors.pink,
    colorClass: tailwindColors.pink,
    key: 'a',
  },
  {
    id: 'staff-showrunner',
    name: 'Show Runner',
    plural: 'Show Runners',
    verb: 'Running the show',
    color: colors.pink,
    colorClass: tailwindColors.pink,
    key: 'a',
  },
  {
    id: 'staff-dataentry',
    name: 'Data Entry',
    plural: 'Data Entry',
    verb: 'Entering Data',
    color: colors.grey,
    colorClass: tailwindColors.slate,
    key: 'e',
  },
  {
    id: 'staff-other',
    name: 'Other',
    plural: 'Other',
    verb: 'Other',
    color: colors.grey,
    colorClass: tailwindColors.slate,
    key: 'o',
  },
  {
    id: 'staff-break',
    name: 'Break',
    plural: 'Break',
    verb: 'Break',
    color: colors.gray,
    colorClass: tailwindColors.gray,
    key: 'b',
  },
  {
    id: 'staff-lunch',
    name: 'Break',
    plural: 'Break',
    verb: 'Break',
    color: colors.gray,
    colorClass: tailwindColors.gray,
    key: 'l',
  },
  {
    id: 'staff-setupteardown',
    name: 'Setup/Teardown',
    color: colors.gray,
    colorClass: tailwindColors.gray,
    plural: 'Setup/Teardown',
    verb: 'Setup/Teardown',
    key: 't',
  },
  {
    id: 'staff-core',
    name: 'Core Staff',
    color: colors.rose,
    colorClass: tailwindColors.rose,
    plural: 'Core Staff',
    verb: 'Core Staff',
    key: 'c',
  },
];

export const AssignmentsMap = Assignments.reduce(
  (map, assignment) => ({
    ...map,
    [assignment.id]: assignment,
  }),
  {}
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

export const AssignmentCodeTitles = {
  'staff-scrambler': 'Scramblers',
  'staff-runner': 'Runners',
  'staff-judge': 'Judges',
  'staff-dataentry': 'Data Entry',
  'staff-showrunner': 'Show Runners',
  'staff-announcer': 'Announcers',
  'staff-delegate': 'Delegates',
  'staff-core': 'Core Staff',
  'staff-break': 'Break',
  'staff-lunch': 'Lunch',
};
