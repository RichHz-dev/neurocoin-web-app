import { useState } from 'react';
import { useScenarioSimulation } from '../hooks/scenario/useScenarioSimulation.js';
import ScenarioConfigurator from './scenario/ScenarioConfigurator.jsx';
import SimulationResults from './scenario/SimulationResults.jsx';

export default function ScenarioPanel({ cryptos, selectedCoin, triggerNotification }) {
  const [targetCoinId, setTargetCoinId] = useState('');
  const activeCoin = cryptos?.find(c => c.coinId === targetCoinId) || selectedCoin;

  const [selectedScenarioId, setSelectedScenarioId] = useState('sec-1');
  const [customDescription, setCustomDescription] = useState('');
  const [customType, setCustomType] = useState('political');
  const [customImpact, setCustomImpact] = useState('bullish');
  const [activeTab, setActiveTab] = useState('predefined');

  const {
    isSimulating,
    simCurve,
    simChannel,
    simCommentary,
    triggerSimulation,
  } = useScenarioSimulation(triggerNotification);

  const predefinedScenarios = [
    {
      id: 'sec-1',
      title: 'Crisis Energética e Hashrate',
      type: 'geographic',
      impact: 'bearish',
      description:
        'Inestabilidad geopolítica regional en Asia Central provoca un apagón masivo y reduce el Hashrate global activo del ecosistema de minería en un 15%.',
    },
    {
      id: 'sec-2',
      title: 'Aprobación de ETFs en América Latina',
      type: 'political',
      impact: 'bullish',
      description:
        'Tres países de Latinoamérica adoptan regulaciones favorables aprobando fondos cotizados (ETF) basados en spot para promover la inclusión financiera masiva.',
    },
    {
      id: 'sec-3',
      title: 'Hype Viral de Magnate de Redes',
      type: 'social',
      impact: 'bullish',
      description:
        'Un famoso magnate de la tecnología publica hilos asertivos de soporte sobre la eficiencia energética del activo en Twitter, desatando histeria minorista de compra.',
    },
    {
      id: 'sec-4',
      title: 'Restricción Fiscal Global Coordinada',
      type: 'political',
      impact: 'bearish',
      description:
        'Organismos globales proponen altos impuestos específicos obligatorios sobre transacciones de protocolos descentralizados de autocustodia.',
    },
    {
      id: 'sec-5',
      title: 'Recorte Sorpresivo de Tasas de la Fed',
      type: 'economic',
      impact: 'bullish',
      description:
        'La Reserva Federal estadounidense decide un recorte agresivo de 50 puntos básicos en las tasas para mitigar la desaceleración del sector manufacturero local.',
    },
    {
      id: 'sec-6',
      title: 'Guerra Fría de Servidores en la Nube',
      type: 'geographic',
      impact: 'volatile',
      description:
        'Un conflicto comercial obliga al cese inmediato de almacenamiento de nodos validadores de blockchain en nubes públicas, induciendo caos de estabilidad.',
    },
  ];

  const currentScenario =
    predefinedScenarios.find((s) => s.id === selectedScenarioId) || predefinedScenarios[0];

  const handleTriggerSimulation = () => {
    const frontendType = activeTab === 'predefined' ? currentScenario.type : customType;
    const frontendImpact = activeTab === 'predefined' ? currentScenario.impact : customImpact;
    const description =
      activeTab === 'predefined'
        ? currentScenario.description
        : customDescription || 'Simulación personalizada de evento global sin descripción proporcionada.';

    triggerSimulation(activeCoin, frontendType, frontendImpact, description);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="scenario-panel">
      <ScenarioConfigurator
        cryptos={cryptos}
        activeCoin={activeCoin}
        setTargetCoinId={setTargetCoinId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedScenarioId={selectedScenarioId}
        setSelectedScenarioId={setSelectedScenarioId}
        customType={customType}
        setCustomType={setCustomType}
        customImpact={customImpact}
        setCustomImpact={setCustomImpact}
        customDescription={customDescription}
        setCustomDescription={setCustomDescription}
        predefinedScenarios={predefinedScenarios}
        isSimulating={isSimulating}
        onTriggerSimulation={handleTriggerSimulation}
      />

      <SimulationResults
        activeCoin={activeCoin}
        isSimulating={isSimulating}
        simCurve={simCurve}
        simChannel={simChannel}
        simCommentary={simCommentary}
      />
    </div>
  );
}