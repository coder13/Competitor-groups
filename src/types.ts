export type APICompetition = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  country_iso2: string;
};

export type Person = {
  registrantId: number;
  name: string;
};
