import tailwindColors from 'tailwindcss/colors';
import { AssignmentCode } from "@wca/helpers";
import { colors } from "./colors";

export type SupportedAssignmentCode = 'competitor' | 'staff-scrambler' | 'staff-runner' | 'staff-judge' | 'staff-delegate' | 'staff-stagelead' | 'staff-announcer' | 'staff-dataentry' | 'staff-other';

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
  letter: string;
}


const Assignments: Array<AssignmentConfig> = [
  {
    id: 'competitor',
    name: 'Competitor',
    plural: 'Competitors',
    verb: 'Competing',
    color: colors.green,
    colorClass: tailwindColors.green,
    key: 'c',
    letter: 'C',
  },
  {
    id: 'staff-scrambler',
    name: 'Scrambler',
    plural: 'Scramblers',
    verb: 'Scrambling',
    color: colors.yellow,
    colorClass: tailwindColors.yellow,
    key: 's',
    letter: 'S',
  },
  {
    id: 'staff-runner',
    name: 'Runner',
    plural: 'Runners',
    verb: 'Running',
    color: colors.red,
    colorClass: tailwindColors.red,
    key: 'r',
    letter: 'R',
  },
  {
    id: 'staff-judge',
    name: 'Judge',
    plural: 'Judges',
    verb: 'Judging',
    color: colors.blue,
    colorClass: tailwindColors.blue,
    key: 'j',
    letter: 'J',
  },
  {
    id: 'staff-delegate',
    name: 'Delegate',
    plural: 'Delegates',
    verb: 'Delegating',
    color: colors.purple,
    colorClass: tailwindColors.purple,
    key: 'd',
    letter: 'D',
  },
  {
    id: 'staff-stagelead',
    name: 'Stage Lead',
    plural: 'Stage Leads',
    verb: 'In Charge',
    color: colors.indigo,
    colorClass: tailwindColors.indigo,
    key: 'l',
    letter: 'L',
  },
  {
    id: 'staff-announcer',
    name: 'Announcer',
    plural: 'Announcers',
    verb: 'Announcing',
    color: colors.pink,
    colorClass: tailwindColors.pink,
    key: 'a',
    letter: 'A',
  },
  {
    id: 'staff-dataentry',
    name: 'Data Entry',
    plural: 'Data Entry',
    verb: 'Entering Data',
    color: colors.grey,
    colorClass: tailwindColors.slate,
    key: 'e',
    letter: 'DA',
  },
  {
    id: 'staff-other',
    name: 'Other',
    plural: 'Other',
    verb: 'Other',
    color: colors.grey,
    colorClass: tailwindColors.slate,
    key: 'o',
    letter: 'O',
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
  'staff-dataentry',
  'staff-announcer',
  'staff-delegate',
];

export const AssignmentCodeTitles = {
  'staff-scrambler': 'Scramblers',
  'staff-runner': 'Runners',
  'staff-judge': 'Judges',
  'staff-dataentry': 'Data Entry',
  'staff-announcer': 'Announcers',
  'staff-delegate': 'Delegates',
};
