const sanitizePageName = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

export const competitionPageName = (pathname: string, competitionId: string) => {
  const competitionRoot = `/competitions/${competitionId}`;
  const relativePath = pathname.replace(competitionRoot, '').replace(/^\/+|\/+$/g, '');
  const segments = relativePath.split('/').filter(Boolean);
  const [section, second, third, fourth] = segments;

  if (!section) {
    return 'groups';
  }

  if (section === 'persons' && second === 'wca') {
    return fourth ? `person_wca_${sanitizePageName(fourth)}` : 'person_wca';
  }

  if (section === 'persons') {
    return third ? `person_${sanitizePageName(third)}` : 'person';
  }

  if (section === 'personal-bests' || section === 'personal-records') {
    return sanitizePageName(section);
  }

  if (section === 'compare-schedules') {
    return 'compare_schedules';
  }

  if (section === 'events') {
    return third ? 'event_group' : second ? 'event_groups' : 'events';
  }

  if (section === 'activities') {
    return second ? 'schedule_activity' : 'schedule';
  }

  if (section === 'rooms') {
    return second ? 'schedule_room' : 'schedule_rooms';
  }

  if (section === 'psych-sheet') {
    return second ? 'psych_sheet_event' : 'psych_sheet';
  }

  if (section === 'results') {
    return second ? 'results_round' : 'results';
  }

  if (section === 'admin') {
    if (second === 'remote') {
      return 'live_activities';
    }

    if (second === 'webhooks') {
      return 'webhooks';
    }

    if (second === 'scramblers') {
      return 'assignments';
    }

    if (second === 'stats') {
      return 'stats';
    }

    if (second === 'sum-of-ranks') {
      return 'sum_of_ranks';
    }

    return second ? 'admin_other' : 'admin';
  }

  if (section === 'remote' || section === 'live') {
    return 'live_activities';
  }

  if (section === 'webhooks') {
    return 'webhooks';
  }

  if (section === 'scramblers') {
    return 'assignments';
  }

  if (section === 'stats') {
    return 'stats';
  }

  if (section === 'sum-of-ranks') {
    return 'sum_of_ranks';
  }

  if (section === 'stream') {
    return 'stream';
  }

  if (section === 'information') {
    return 'information';
  }

  if (section === 'explore') {
    return 'explore';
  }

  if (section === 'groups-schedule') {
    return 'groups_schedule';
  }

  return 'other';
};
