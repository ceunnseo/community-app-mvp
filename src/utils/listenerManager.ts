// utils/listenerManager.ts
export const listeners: (() => void)[] = [];

export const addListener = (unsubscribe: () => void) => {
  listeners.push(unsubscribe);
};

export const clearAllListeners = () => {
  while (listeners.length) {
    const unsubscribe = listeners.pop();
    if (unsubscribe) unsubscribe();
  }
};
