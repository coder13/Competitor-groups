import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClassNamesConfig, StylesConfig } from 'react-select';
import AsyncSelect from 'react-select/async';
import { OptionProps } from 'react-select/dist/declarations/src';
import { fetchSearchCompetition } from '@/lib/api';
import { useUserSettings } from '@/providers/UserSettingsProvider';
import { CompetitionListItem } from '../CompetitionListItem';

export interface CompetitionSelectProps {
  onSelect: (competitionId: string) => void;
  className?: string;
}

export const CompetitionSelect = ({ onSelect, className }: CompetitionSelectProps) => {
  const { t } = useTranslation();
  const { effectiveTheme } = useUserSettings();
  const isDark = effectiveTheme === 'dark';

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

  const classNames: ClassNamesConfig<ApiCompetition, false> = {
    control: (state) =>
      [
        // Base sizing and rounded look
        'min-h-[38px] rounded-md',
        // Backgrounds
        'bg-panel',
        // Borders + focus
        'border border-tertiary-weak',
        state.isFocused
          ? 'ring-1 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400'
          : '',
      ].join(' '),
    valueContainer: () => 'text-gray-900 dark:text-white',
    singleValue: () => 'text-gray-900 dark:text-white',
    input: () => 'text-gray-900 dark:text-white',
    placeholder: () => 'text-muted',
    indicatorsContainer: () => 'text-muted',
    dropdownIndicator: (state) =>
      ['text-muted', state.isFocused ? 'text-blue-600 dark:text-blue-400' : ''].join(' '),
    clearIndicator: () => 'text-muted hover-text-tertiary',
    menu: () => 'bg-panel border border-tertiary-weak shadow-md',
    menuList: () => 'bg-panel',
    option: (state) =>
      [
        'text-gray-900 dark:text-white',
        state.isFocused ? 'bg-tertiary-strong' : '',
        state.isSelected ? 'bg-blue-100 dark:bg-blue-900' : '',
      ].join(' '),
    noOptionsMessage: () => 'text-muted',
  };

  const styles: StylesConfig<ApiCompetition, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? (isDark ? '#60a5fa' : '#3b82f6') : base.borderColor,
      boxShadow: state.isFocused ? `0 0 0 1px ${isDark ? '#60a5fa' : '#3b82f6'}` : 'none',
      ':hover': {
        ...base[':hover'],
        borderColor: state.isFocused ? (isDark ? '#60a5fa' : '#3b82f6') : base.borderColor,
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'transparent',
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: 'transparent',
    }),
    option: (base) => ({
      ...base,
      backgroundColor: 'transparent',
    }),
    input: (base) => ({
      ...base,
      color: isDark ? '#ffffff' : '#111827', // gray-900
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? '#ffffff' : '#111827', // gray-900
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#9ca3af' : '#4b5563', // dark: gray-400, light: gray-600
    }),
  };

  return (
    <AsyncSelect<ApiCompetition>
      className={className}
      classNamePrefix="cg-select"
      cacheOptions
      loadOptions={loadOptions}
      placeholder={t('common.competitionSelect.placeholder')}
      noOptionsMessage={() => t('common.competitionSelect.noOptions')}
      components={{
        Option: CompetitionOption,
      }}
      classNames={classNames}
      styles={styles}
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
