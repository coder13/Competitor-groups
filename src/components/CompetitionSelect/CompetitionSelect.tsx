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
  const colors = {
    controlBackground: isDark ? '#1f2937' : '#ffffff',
    optionBackground: isDark ? '#1f2937' : '#ffffff',
    optionFocusedBackground: isDark ? '#374151' : '#e5e7eb',
    optionSelectedBackground: isDark ? '#1e3a8a' : '#dbeafe',
    text: isDark ? '#ffffff' : '#111827',
    mutedText: isDark ? '#9ca3af' : '#4b5563',
    border: isDark ? '#374151' : '#e5e7eb',
    menuBorder: isDark ? '#4b5563' : '#cbd5e1',
    focusBorder: isDark ? '#60a5fa' : '#3b82f6',
  };

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
        'px-1.5',
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
    menu: () => 'bg-panel border border-tertiary-weak shadow-md dropdown-open-transition',
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
      backgroundColor: colors.controlBackground,
      borderColor: state.isFocused ? colors.focusBorder : colors.border,
      boxShadow: state.isFocused ? `0 0 0 1px ${colors.focusBorder}` : 'none',
      ':hover': {
        ...base[':hover'],
        borderColor: state.isFocused ? colors.focusBorder : colors.border,
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: colors.optionBackground,
      border: `1px solid ${colors.menuBorder}`,
      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.38)',
      overflow: 'hidden',
      zIndex: 1000,
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: colors.optionBackground,
      paddingBottom: 0,
      paddingTop: 0,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? colors.optionSelectedBackground
        : state.isFocused
          ? colors.optionFocusedBackground
          : colors.optionBackground,
      color: colors.text,
      cursor: 'pointer',
      padding: 0,
      ':active': {
        ...base[':active'],
        backgroundColor: colors.optionSelectedBackground,
      },
    }),
    input: (base) => ({
      ...base,
      color: colors.text,
    }),
    singleValue: (base) => ({
      ...base,
      color: colors.text,
    }),
    placeholder: (base) => ({
      ...base,
      color: colors.mutedText,
    }),
  };

  return (
    <AsyncSelect<ApiCompetition>
      className={className}
      classNamePrefix="cg-select"
      cacheOptions
      loadOptions={loadOptions}
      placeholder={t('common.competitionSelect.placeholder')}
      noOptionsMessage={({ inputValue }) =>
        inputValue.trim() ? t('common.competitionSelect.noOptions') : null
      }
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
  return <CompetitionListItem {...data} isLive={false} variant="dropdown" />;
};

function useDebounced<Input, Output>(
  fn: (arg: Input) => Promise<Output>,
  delay: number,
): (arg: Input) => Promise<Output> {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
