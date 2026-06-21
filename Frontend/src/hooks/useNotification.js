import { useState } from 'react';

export function useNotification() {
  const [notification, setNotification] = useState(null);

  const triggerNotification = (msg) => {
    const id = Date.now();
    setNotification({ msg, id });
    setTimeout(() => setNotification((prev) => (prev?.id === id ? null : prev)), 7000);
  };

  return { notification, triggerNotification };
}
