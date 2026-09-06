import { useTasks } from '../hooks/useTasks.js';
import Button from './Button/Button.jsx';

function taskLabel(mutation) {
  return (
    mutation.changes?.title ??
    mutation.task?.title ??
    mutation.conflict?.current?.title ??
    'Task'
  );
}

export default function SyncStatusBar() {
  const {
    isOnline,
    syncing,
    syncError,
    pendingCount,
    conflicts,
    failedMutations,
    retrySynchronization,
    keepServerVersion,
    retryQueuedMutation,
  } = useTasks();
  const hasStatus =
    !isOnline ||
    syncing ||
    pendingCount > 0 ||
    conflicts.length > 0 ||
    failedMutations.length > 0 ||
    Boolean(syncError);

  if (!hasStatus) {
    return null;
  }

  return (
    <aside
      className={`sync-status ${!isOnline ? 'sync-status--offline' : ''}`}
      aria-live="polite"
    >
      <div className="sync-status__inner">
        <div className="sync-status__summary">
          <strong>
            {syncing
              ? 'Synchronizing changes'
              : isOnline
                ? 'Task synchronization'
                : 'Working offline'}
          </strong>
          <span>
            {!isOnline
              ? 'Changes are saved on this device and will sync after reconnection.'
              : pendingCount > 0
                ? `${pendingCount} change${pendingCount === 1 ? '' : 's'} waiting to sync.`
                : 'Review the task changes that need attention.'}
          </span>
        </div>

        {!syncing && (!isOnline || pendingCount > 0) && (
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={retrySynchronization}
          >
            {isOnline ? 'Sync now' : 'Try reconnecting'}
          </Button>
        )}
      </div>

      {(syncError || conflicts.length > 0 || failedMutations.length > 0) && (
        <div className="sync-status__issues">
          {syncError && (
            <div className="sync-issue" role="alert">
              <div>
                <strong>Synchronization paused</strong>
                <span>{syncError}</span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={retrySynchronization}
              >
                Retry
              </Button>
            </div>
          )}

          {conflicts.map((conflict) => (
            <div
              className="sync-issue sync-issue--conflict"
              key={conflict.queueId}
            >
              <div>
                <strong>{taskLabel(conflict)} was changed elsewhere</strong>
                <span>
                  Your edit used version {conflict.conflict?.yourVersion}; the
                  server now has version {conflict.conflict?.current?.version}.
                </span>
              </div>
              <div className="sync-issue__actions">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={syncing}
                  onClick={() => keepServerVersion(conflict.queueId)}
                >
                  Keep server version
                </Button>
                <Button
                  type="button"
                  size="small"
                  disabled={syncing}
                  onClick={() => retryQueuedMutation(conflict.queueId)}
                >
                  Apply my changes
                </Button>
              </div>
            </div>
          ))}

          {failedMutations.map((mutation) => (
            <div className="sync-issue" key={mutation.queueId} role="alert">
              <div>
                <strong>{taskLabel(mutation)} could not be synchronized</strong>
                <span>
                  {mutation.failure?.message ??
                    'The server rejected this change.'}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="small"
                disabled={syncing || !isOnline}
                onClick={() => retryQueuedMutation(mutation.queueId)}
              >
                Retry
              </Button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
