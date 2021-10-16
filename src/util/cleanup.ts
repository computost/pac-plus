const cleanupActions: CleanupAction[] = [];

export function addCleanupAction(action: CleanupAction) {
  cleanupActions.push(action);
}

export function cleanup() {
  const toDo = cleanupActions.splice(0);
  return Promise.all(toDo.map((action) => action()));
}

type CleanupAction = () => Promise<void>;
