import { Competition } from '@wca/helpers';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { nextActivityCode, prevActivityCode } from '@/lib/activityCodes';

interface GroupButtonMenuProps {
  wcif?: Competition;
  activityCode: string;
}

export const GroupButtonMenu = ({ wcif, activityCode }: GroupButtonMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitionId } = useParams();

  const prev = wcif && prevActivityCode(wcif, activityCode);
  const next = wcif && nextActivityCode(wcif, activityCode);

  const prevUrl = `/competitions/${competitionId}/events/${prev?.split?.('-g')?.[0]}/${
    prev?.split?.('-g')?.[1]
  }`;
  const nextUrl = `/competitions/${competitionId}/events/${next?.split?.('-g')?.[0]}/${
    next?.split?.('-g')?.[1]
  }`;

  const goToPrev = useCallback(() => {
    if (prev) {
      navigate(prevUrl);
    }
  }, [prev, navigate, prevUrl]);

  const goToNext = useCallback(() => {
    if (next) {
      navigate(nextUrl);
    }
  }, [next, navigate, nextUrl]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrev();
      }

      if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [wcif, activityCode, goToPrev, goToNext]);

  return (
    <div className="flex space-x-2">
      <Link
        to={prevUrl || ''}
        className={classNames(
          'w-full border rounded-md p-2 px-2 flex cursor-pointer transition-colors my-1 justify-end',
          {
            'pointer-events-none opacity-25': !prev,
            'hover:bg-slate-100 group cursor-pointer': prev,
          },
        )}>
        <span className="fa fa-arrow-left self-center mr-2 group-hover:-translate-x-2 transition-all" />
        {t('competition.groups.previousGroup')}
      </Link>
      <Link
        to={nextUrl || ''}
        className={classNames(
          'w-full border rounded-md p-2 px-2 flex cursor-pointer group hover:bg-slate-100 transition-colors my-1',
          {
            'pointer-events-none opacity-25': !next,
            'hover:bg-slate-100 group': next,
          },
        )}>
        {t('competition.groups.nextGroup')}
        <span className="fa fa-arrow-right self-center ml-2 group-hover:translate-x-2 transition-all" />
      </Link>
    </div>
  );
};
