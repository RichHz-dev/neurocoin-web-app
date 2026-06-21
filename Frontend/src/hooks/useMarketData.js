import { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';

export function useMarketData(refreshInterval = 10000) {
  const [cryptos, setCryptos] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [loadingCryptos, setLoadingCryptos] = useState(true);

  // Evita que la referencia a selectedCoin en el interval quede desactualizada
  const selectedCoinRef = useRef(selectedCoin);
  useEffect(() => {
    selectedCoinRef.current = selectedCoin;
  }, [selectedCoin]);

  const fetchMarketData = async () => {
    try {
      // El backend expone: GET /api/cryptos → devuelve array de documentos Crypto
      const { data } = await api.get('/api/cryptos');

      // El controller devuelve el array directamente (sin wrapper .cryptos)
      const list = Array.isArray(data) ? data : data.cryptos ?? [];

      if (list.length === 0) return;

      setCryptos(list);

      // ACTUALIZACIÓN DE ESTADO SEGURA (Adiós selectedCoinRef)
      setSelectedCoin((prevSelected) => {
        // 1. Si es la primera vez (no hay moneda seleccionada)
        if (!prevSelected) {
          return list.find((c) => c.coinId === 'bitcoin') || list[0];
        }

        // 2. Si el usuario ya seleccionó una, buscamos esa misma para actualizar su precio
        const updatedCoin = list.find((c) => c.coinId === prevSelected.coinId);

        // 3. Devolvemos la moneda actualizada, o mantenemos la que estaba si hubo error
        return updatedCoin || prevSelected;
      });

      // Apagamos el loader si es la primera carga
      if (loadingCryptos) {
        setLoadingCryptos(false);
      }

    } catch (err) {
      console.error('Error al obtener tasas financieras:', err.message);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, refreshInterval); // coincide con el intervalo del backend
    return () => clearInterval(interval);
  }, [refreshInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  return { cryptos, selectedCoin, setSelectedCoin, loadingCryptos };
}
