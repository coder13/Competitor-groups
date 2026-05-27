import { isCompetitionDelegateOrOrganizer } from './competitionAuthorization';

const wcif = {
  persons: [
    {
      roles: ['organizer'],
      wcaUserId: 1,
    },
    {
      roles: ['trainee-delegate'],
      wcaUserId: 2,
    },
    {
      roles: ['staff-dataentry'],
      wcaUserId: 3,
    },
  ],
};

describe('isCompetitionDelegateOrOrganizer', () => {
  it('allows listed organizers and delegates', () => {
    expect(isCompetitionDelegateOrOrganizer(wcif as never, { id: 1 })).toBe(true);
    expect(isCompetitionDelegateOrOrganizer(wcif as never, { id: 2 })).toBe(true);
  });

  it('rejects non-manager staff and missing users', () => {
    expect(isCompetitionDelegateOrOrganizer(wcif as never, { id: 3 })).toBe(false);
    expect(isCompetitionDelegateOrOrganizer(wcif as never, { id: 4 })).toBe(false);
    expect(isCompetitionDelegateOrOrganizer(wcif as never, null)).toBe(false);
  });
});
