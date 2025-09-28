import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/Modal';
import { PersonSelector } from '@/components/PersonSelector';
import { useCompareSchedulesState } from '@/hooks/useCompareSchedulesState';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompareSchedulesButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompareSchedulesButton = ({
  variant = 'secondary',
  size = 'md',
  className = '',
}: CompareSchedulesButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitionId } = useWCIF();
  const { selectedPersonIds } = useCompareSchedulesState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (selectedPersonIds.length === 0) {
      // Open modal to select people first
      setIsModalOpen(true);
    } else {
      // Navigate directly to compare schedules
      navigate(`/competitions/${competitionId}/compare-schedules`);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePersonToggle = () => {
    // After selecting people, navigate to compare schedules
    if (selectedPersonIds.length > 0) {
      setIsModalOpen(false);
      navigate(`/competitions/${competitionId}/compare-schedules`);
    }
  };

  const buttonClasses = `
    inline-flex items-center justify-center rounded-md font-medium transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:pointer-events-none
    ${
      variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
    }
    ${size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-sm'}
    ${className}
  `.trim();

  return (
    <>
      <button onClick={handleClick} className={buttonClasses} type="button">
        <span className="fa fa-users mr-2" />
        {t('competition.compareSchedules.buttonText')}
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={t('competition.compareSchedules.selectPeople')}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            {t('competition.compareSchedules.selectPeopleInstructions')}
          </p>
          <PersonSelector onPersonToggle={handlePersonToggle} showCurrentUser />
        </div>
      </Modal>
    </>
  );
};
