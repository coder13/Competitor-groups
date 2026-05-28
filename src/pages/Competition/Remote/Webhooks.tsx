import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { NoteBox } from '@/components/Notebox';
import { isCompetitionDelegateOrOrganizer } from '@/lib/competitionAuthorization';
import { NotifyCompCompetition, RemoteCompetitionDocument } from '@/lib/notifyCompRemoteGraphql';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { RemoteWebhookSetup } from './RemoteWebhookSetup';

export default function CompetitionRemoteWebhooks() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { wcif, setTitle } = useWCIF();
  const { user } = useAuth();
  const remoteAuth = useNotifyCompRemoteAuth();
  const canManageRemote = isCompetitionDelegateOrOrganizer(wcif, user);
  const isAuthenticated = remoteAuth.isAuthenticatedForCompetition(competitionId || '');
  const canLoadRemoteCompetition = Boolean(competitionId && isAuthenticated && canManageRemote);

  const remoteCompetitionQuery = useQuery<{ competition: NotifyCompCompetition | null }>(
    RemoteCompetitionDocument,
    {
      variables: { competitionId },
      skip: !canLoadRemoteCompetition,
    },
  );

  useEffect(() => {
    setTitle('Webhooks');
  }, [setTitle]);

  if (!competitionId || !wcif) {
    return null;
  }

  const accessDenied = (Boolean(user) || isAuthenticated) && !canManageRemote;

  return (
    <Container className="px-4 py-8">
      <div className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <h1 className="type-heading">Webhooks</h1>
          <p className="type-body-sm text-subtle">
            Send Live Activities updates to another service when activities start or stop.
          </p>
          <Link
            to={`/competitions/${competitionId}/admin/remote`}
            className="link-inline type-body-sm">
            Back to Live Activities Remote
          </Link>
        </div>

        {remoteAuth.error && <NoteBox prefix="Remote sign in" text={remoteAuth.error} />}

        {accessDenied ? (
          <NoteBox
            prefix="Webhook access"
            text="Only listed delegates and organizers for this competition can manage webhooks."
          />
        ) : !isAuthenticated ? (
          <div className="space-y-4">
            <p className="max-w-3xl type-body-sm text-subtle">
              Sign in to Live Activities Remote with your WCA account before managing webhooks.
            </p>
            <Button
              type="button"
              disabled={remoteAuth.authenticating}
              onClick={() => {
                void remoteAuth.signIn(competitionId);
              }}>
              {remoteAuth.authenticating ? 'Signing in...' : 'Sign in to Live Activities Remote'}
            </Button>
          </div>
        ) : (
          <>
            {remoteCompetitionQuery.loading && <BarLoader width="100%" />}
            {remoteCompetitionQuery.error && (
              <NoteBox prefix="Webhook error" text={remoteCompetitionQuery.error.message} />
            )}

            {!remoteCompetitionQuery.loading && !remoteCompetitionQuery.data?.competition ? (
              <div className="space-y-4">
                <NoteBox
                  prefix="Not imported"
                  text="Import the published schedule into Live Activities Remote before creating webhooks."
                />
                <Link
                  to={`/competitions/${competitionId}/admin/remote`}
                  className="btn btn-blue inline-flex">
                  Go to Remote
                </Link>
              </div>
            ) : (
              remoteCompetitionQuery.data?.competition && (
                <RemoteWebhookSetup competitionId={competitionId} />
              )
            )}
          </>
        )}
      </div>
    </Container>
  );
}
