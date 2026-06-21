import { useState, useEffect } from 'react';
import api from '../../services/api.js';

export function useCryptoML(selectedCoin, timeframe, triggerNotification) {
  const [isPredicting, setIsPredicting] = useState(false);
  const [allPredictions, setAllPredictions] = useState(null);
  const [predictionCommentary, setPredictionCommentary] = useState('');
  const [mlLogs, setMlLogs] = useState([]);

  // Auto-reset prediction when the selected coin changes
  useEffect(() => {
    resetPrediction();
  }, [selectedCoin?.coinId]);

  const predictionCurve = allPredictions ? allPredictions[timeframe]?.estimatedCurve || null : null;
  const predictionChannel = allPredictions ? allPredictions[timeframe]?.fluctuationChannel || null : null;

  const runPredictiveModel = async () => {
    if (!selectedCoin) return;
    setIsPredicting(true);
    setAllPredictions(null);
    setPredictionCommentary('');
    setMlLogs([]);

    const steps = [
      '🐍 Conectando con el motor Python ML Service...',
      `📈 Analizando histórico y volatilidad del activo...`,
      '🛠️ Calculando medias móviles e índices de fuerza relativa (RSI)...',
      '🔄 Computando matriz multi-timeframe (1H, 1D, 1M, 1Y)...',
      '⚡ Ajustando canales de volatilidad probabilísticos...',
      '🧬 Generando conclusión técnica con IA generativa...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((res) => setTimeout(res, 350));
      setMlLogs((prev) => [...prev, steps[i]]);
    }

    try {
      const { data } = await api.post('/api/cryptos/forecast', {
        coinId: selectedCoin.coinId
      });

      if (data.predictions) {
        setAllPredictions(data.predictions);
        setPredictionCommentary(data.aiConclusion || '');
      }
    } catch {
      triggerNotification('⚠️ Error al conectar con el motor predictivo.');
    } finally {
      setIsPredicting(false);
    }
  };

  const resetPrediction = () => {
    setAllPredictions(null);
    setPredictionCommentary('');
  };

  return {
    isPredicting,
    predictionCurve,
    predictionChannel,
    predictionCommentary,
    mlLogs,
    runPredictiveModel,
    resetPrediction
  };
}
