import { useState } from 'react';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  const handleAddAlert = (coinId, coinName, condition, value) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      coinId,
      coinName,
      condition,
      value,
      isActive: true,
      isTriggered: false,
      createdAt: new Date().toLocaleTimeString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (id) => setAlerts((prev) => prev.filter((al) => al.id !== id));

  return { alerts, handleAddAlert, handleDeleteAlert };
}
