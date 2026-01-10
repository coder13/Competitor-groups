import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';

const Link = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <a className="text-blue-700 underline" href={to} target="_blank" rel="noreferrer">
    {children}
  </a>
);

export default function About() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t('about.title')} - t('common.appName')`;
  }, [t]);

  return (
    <Container className="overflow-auto">
      <div className="flex flex-col items-center">
        <div className="flex flex-col p-2 pt-2 space-y-4 text-sm text-gray-800 md:text-base md:px-0 dark:text-white">
          <p>{t('about.welcome')}</p>
          <p className="leading-relaxed">{t('about.purpose')} </p>
          <p className="leading-relaxed">{t('about.startTimes')} </p>

          <p className="leading-relaxed">
            <Trans i18nKey="about.competitionAssignments">
              To get your competition{"'"}s assignments to show here, you must generate them with a
              tool like <Link to="https://groupifier.jonatanklosko.com/">Groupifier</Link>,{' '}
              <Link to="https://delegate-dashboard.netlify.app/">DelegateDashboard</Link>, or{' '}
              <Link to="https://goosly.github.io/AGE/">AGE</Link>.
            </Trans>
          </p>

          <p className="leading-relaxed">
            <Trans i18nKey="about.developer">
              If you are a developer and you want to learn more about the data that is shown here,
              check out the{' '}
              <Link to="https://github.com/thewca/wcif/blob/master/specification.md">
                WCIF specification
              </Link>
              .
            </Trans>
          </p>
          <br />
          <p className="leading-relaxed">
            <Trans i18nKey="about.peopleCanBe">
              People can be assigned to groups, rounds, or any arbitrary activity. If you want to
              get creative with the website, feel free to{' '}
              <Link to="https://github.com/coder13">reach out to me</Link>!
            </Trans>
          </p>
          <br />
          <p className="leading-relaxed">
            If you find this website useful, you can support me by donating{' '}
            <Link to="https://cailynhoover.com/donate">here</Link>.
          </p>
        </div>
      </div>
    </Container>
  );
}
