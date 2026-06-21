import { useState, useEffect } from 'react';
import api from '../../services/api.js';

export function useCryptoHistory(selectedCoin, timeframe, triggerNotification) {
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!selectedCoin || timeframe === 'REALTIME') return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const { data } = await api.get(`/api/cryptos/${selectedCoin.coinId}/history?timeframe=${timeframe}`);
        setHistoricalData(data);
      } catch (err) {
        console.error('Error obteniendo historial:', err);
        triggerNotification(`⚠️ No se pudo cargar el historial de ${timeframe}`);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, selectedCoin?.coinId]);

  return { historicalData, isLoadingHistory };
}
