import { Competition, Person, PersonalBest, Round, Result, Qualification } from '@wca/helpers';

// Keep the application's established helper model at this single API boundary.
// These aliases are not a v1 downgrade: v2 participation rules, linked rounds,
// qualification and extension data are retained verbatim.
type V2PersonalBest = Omit<PersonalBest, 'best'> & { value: PersonalBest['best'] };
type V2Result = Omit<Result, 'attempts'> & {
  attempts: Array<
    Omit<Result['attempts'][number], 'result'> & {
      value: Result['attempts'][number]['result'];
    }
  >;
};
type V2Qualification = {
  earliestResultDate?: string | null;
  latestResultDate: string;
  resultCondition: {
    type: 'ranking' | 'resultAchieved';
    scope: 'single' | 'average';
    value: number | null;
  };
};

export type WcifV2 = Omit<Competition, 'persons' | 'events'> & {
  persons: Array<Omit<Person, 'personalBests'> & { personalBests?: V2PersonalBest[] }>;
  events: Array<
    Omit<Competition['events'][number], 'rounds' | 'qualification'> & {
      qualification?: V2Qualification | null;
      rounds: Array<Omit<Round, 'results' | 'advancementCondition'> & { results: V2Result[] }>;
    }
  >;
};

const resultValue = (value: number): number => {
  // Zero (unattempted), -1 (DNF), -2 (DNS) and encoded multi-blind values
  // must survive unchanged. Never manufacture a result from a missing field.
  if (!Number.isSafeInteger(value) || value < -2) {
    throw new Error('Invalid WCIF v2 result value');
  }
  return value;
};

const qualificationAlias = (qualification: V2Qualification): Qualification => {
  const { resultCondition } = qualification;
  const common = { ...qualification, resultType: resultCondition.scope };
  if (resultCondition.type === 'ranking') {
    if (resultCondition.value == null) throw new Error('Invalid WCIF v2 qualification');
    return {
      ...common,
      type: 'ranking',
      whenDate: qualification.latestResultDate,
      level: resultCondition.value,
    };
  }
  return {
    ...common,
    type: resultCondition.value == null ? 'anyResult' : 'attemptResult',
    when: qualification.latestResultDate,
    level: resultCondition.value ?? 0,
  };
};

export const normalizeWcifV2 = (wcif: WcifV2): Competition => {
  if (!/^2\.\d+(?:\.\d+)?$/.test(wcif.formatVersion)) {
    throw new Error('Expected WCIF major version 2');
  }
  return {
    ...wcif,
    persons: wcif.persons.map((person) => ({
      ...person,
      personalBests: person.personalBests?.map((best) => ({
        ...best,
        best: resultValue(best.value),
      })),
    })),
    events: wcif.events.map((event) => ({
      ...event,
      qualification: event.qualification
        ? qualificationAlias(event.qualification)
        : event.qualification,
      rounds: event.rounds.map((round) => ({
        ...round,
        advancementCondition: null,
        results: round.results.map((result) => ({
          ...result,
          attempts: result.attempts.map((attempt) => ({
            ...attempt,
            result: resultValue(attempt.value),
          })),
        })),
      })),
    })),
  };
};
