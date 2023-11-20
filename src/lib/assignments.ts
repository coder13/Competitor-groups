import { Assignment, AssignmentCode } from "@wca/helpers";

export type AssignmentConfig = {
  id: string;
  name: string;
  /**
   * Tailwind color class.
   */
  color: string;
  key: string;
  letter: string;
}

const Assignments: Array<AssignmentConfig> = [
  {
    id: 'competitor',
    name: 'Competitor',
    color: 'green',
    key: 'c',
    letter: 'C',
  },
  {
    id: 'staff-scrambler',
    name: 'Scrambler',
    color: 'yellow',
    key: 's',
    letter: 'S',
  },
  {
    id: 'staff-runner',
    name: 'Runner',
    color: 'red',
    key: 'r',
    letter: 'R',
  },
  {
    id: 'staff-judge',
    name: 'Judge',
    color: 'blue',
    key: 'j',
    letter: 'J',
  },
  {
    id: 'staff-delegate',
    name: 'Delegate',
    color: 'purple',
    key: 'd',
    letter: 'D',
  },
  {
    id: 'staff-stagelead',
    name: 'Stage Lead',
    color: 'indigo',
    key: 'l',
    letter: 'L',
  },
  {
    id: 'staff-announcer',
    name: 'Announcer',
    color: 'pink',
    key: 'a',
    letter: 'A',
  },
  {
    id: 'staff-dataentry',
    name: 'Data Entry',
    color: 'grey',
    key: 'e',
    letter: 'DA',
  },
  {
    id: 'staff-other',
    name: 'Other',
    color: 'grey',
    key: 'o',
    letter: 'O',
  },
];

export const AssignmentsMap: Record<Assignment['assignmentCode'], AssignmentConfig> = Assignments.reduce(
  (map, assignment) => ({
    ...map,
    [assignment.id]: assignment,
  }),
  {}
);

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
