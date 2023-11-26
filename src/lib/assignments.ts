import tailwindColors from 'tailwindcss/colors';
import { AssignmentCode } from "@wca/helpers";
import { colors } from "./colors";

export type SupportedAssignmentCode = 'competitor' | 'staff-scrambler' | 'staff-runner' | 'staff-judge' | 'staff-delegate' | 'staff-stagelead' | 'staff-announcer' | 'staff-dataentry' | 'staff-other';

export type AssignmentConfig = {
  id: SupportedAssignmentCode;
  name: string;
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
    color: colors.green,
    colorClass: tailwindColors.green,
    key: 'c',
    letter: 'C',
  },
  {
    id: 'staff-scrambler',
    name: 'Scrambler',
    color: colors.yellow,
    colorClass: tailwindColors.yellow,
    key: 's',
    letter: 'S',
  },
  {
    id: 'staff-runner',
    name: 'Runner',
    color: colors.red,
    colorClass: tailwindColors.red,
    key: 'r',
    letter: 'R',
  },
  {
    id: 'staff-judge',
    name: 'Judge',
    color: colors.blue,
    colorClass: tailwindColors.blue,
    key: 'j',
    letter: 'J',
  },
  {
    id: 'staff-delegate',
    name: 'Delegate',
    color: colors.purple,
    colorClass: tailwindColors.purple,
    key: 'd',
    letter: 'D',
  },
  {
    id: 'staff-stagelead',
    name: 'Stage Lead',
    color: colors.indigo,
    colorClass: tailwindColors.indigo,
    key: 'l',
    letter: 'L',
  },
  {
    id: 'staff-announcer',
    name: 'Announcer',
    color: colors.pink,
    colorClass: tailwindColors.pink,
    key: 'a',
    letter: 'A',
  },
  {
    id: 'staff-dataentry',
    name: 'Data Entry',
    color: colors.grey,
    colorClass: tailwindColors.slate,
    key: 'e',
    letter: 'DA',
  },
  {
    id: 'staff-other',
    name: 'Other',
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
