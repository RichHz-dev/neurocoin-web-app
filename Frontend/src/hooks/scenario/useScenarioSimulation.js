import { useState } from 'react';
import api from '../../services/api.js';

// Mapeo de los tipos de escenario del frontend al enum que espera el backend
const CONTEXT_TYPE_MAP = {
  geographic: 'geografico',
  political: 'politico',
  social: 'social',
  economic: 'economico',
};

// Mapeo del impacto del frontend al enum del backend
const IMPACT_MAP = {
  bullish: 'alcista',
  bearish: 'bajista',
  volatile: 'volatil',
};

export function useScenarioSimulation(triggerNotification) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simCurve, setSimCurve] = useState(null);
  const [simChannel, setSimChannel] = useState(null);
  const [simCommentary, setSimCommentary] = useState('');

  const triggerSimulation = async (activeCoin, type, impact, description) => {
    if (!activeCoin) {
      triggerNotification('Por favor, selecciona una moneda virtual válida.');
      return;
    }

    setIsSimulating(true);
    setSimCurve(null);
    setSimChannel(null);
    setSimCommentary('');

    const payload = {
      coinId: activeCoin.coinId,
      contextType: CONTEXT_TYPE_MAP[type] || 'economico',
      expectedImpact: IMPACT_MAP[impact] || 'volatil',
      description,
    };

    try {
      const { data } = await api.post('/api/scenarios/simulate', payload);

      if (data.estimatedCurve && data.estimatedCurve.length > 0) {
        setSimCurve(data.estimatedCurve);
        setSimChannel(data.fluctuationChannel || []);
        setSimCommentary(data.aiConclusion || '');
        triggerNotification(
          `¡Simulación exitosa para ${activeCoin.name}! Impacto computado: ${payload.expectedImpact}.`
        );
      }
    } catch (err) {
      console.error('Error en la simulación de escenario:', err.message);
      triggerNotification('Fallo de red al solicitar estimación de escenario. Verifica el backend.');
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    isSimulating,
    simCurve,
    simChannel,
    simCommentary,
    triggerSimulation,
  };
}
