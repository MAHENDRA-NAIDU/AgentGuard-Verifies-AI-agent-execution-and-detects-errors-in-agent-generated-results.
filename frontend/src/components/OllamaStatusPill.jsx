import React, { useState, useEffect } from 'react';
import { getOllamaHealth } from '../services/api';
import { Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';

export function OllamaStatusPill() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const data = await getOllamaHealth();
      setHealth(data);
    } catch {
      setHealth({ connected: false, configuredModel: 'qwen2.5:7b' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 border border-sand text-xs text-muted">
        <Cpu className="w-3.5 h-3.5 animate-pulse" />
        <span>Checking Ollama...</span>
      </div>
    );
  }

  const isConnected = health?.connected;
  const modelName = health?.configuredModel || 'qwen2.5:7b';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
        isConnected
          ? 'bg-[#EAF3ED] border-[#B8D9C5] text-[#2F6146]'
          : 'bg-[#FCEFEB] border-[#F2BEB6] text-[#B93826]'
      }`}
      title={
        isConnected
          ? `Connected to Ollama at ${health.baseUrl} (Model: ${modelName})`
          : 'Ollama is unreachable. Please ensure `ollama serve` is running.'
      }
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D7A5A] opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-[#3D7A5A]' : 'bg-[#B93826]'
          }`}
        ></span>
      </span>
      <span className="font-semibold uppercase tracking-wider">Ollama</span>
      <span className="opacity-40">|</span>
      <span className="truncate max-w-[120px]">{modelName}</span>
    </div>
  );
}

export default OllamaStatusPill;
