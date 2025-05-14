import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncSelect from 'react-select/async';
import { OptionProps } from 'react-select/dist/declarations/src';
import { fetchSearchCompetition } from '@/lib/api';
import { CompetitionListItem } from '../CompetitionListItem';

export interface CompetitionSelectProps {
  onSelect: (competitionId: string) => void;
  className?: string;
}

export const CompetitionSelect = ({ onSelect, className }: CompetitionSelectProps) => {
  const { t } = useTranslation();

  const loadOptions = useDebounced(async (inputValue: string) => {
    try {
      const res = await fetchSearchCompetition(inputValue);
      return res?.result;
    } catch (e) {
      console.error(e);
      return [];
    }
  }, 200);

  const handleSelectOption = useCallback(
    (e: ApiCompetition | null) => {
      if (!e) return;

      onSelect(e.id);
    },
    [onSelect],
  );

  return (
    <AsyncSelect<ApiCompetition>
      className={className}
      cacheOptions
      loadOptions={loadOptions}
      placeholder={t('common.competitionSelect.placeholder')}
      components={{
        Option: CompetitionOption,
      }}
      onChange={handleSelectOption}
    />
  );
};

export const CompetitionOption = ({ data }: OptionProps<ApiCompetition>) => {
  return <CompetitionListItem {...data} isLive={false} />;
};

function useDebounced<Input, Output>(
  fn: (arg: Input) => Promise<Output>,
  delay: number,
): (arg: Input) => Promise<Output> {
  const timeout = useRef<number | null>(null);

  return useCallback(
    (arg: Input) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      return new Promise((resolve) => {
        timeout.current = setTimeout(async () => {
          resolve(await fn(arg));
        }, delay);
      });
    },
    [fn, delay],
  );
}
