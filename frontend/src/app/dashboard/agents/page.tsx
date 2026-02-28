"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    Cpu, Power, Settings2, Sparkles,
    MessageSquare, ShieldAlert, History,
    CheckCircle2, XCircle, AlertCircle, Save,
    Youtube, Instagram, Languages, MessageCircle, Clock, Info
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

interface Integration {
    id: string;
    platform: string;
    channel_name: string;
    is_active: boolean;
}

interface AgentConfig {
    persona_name: string;
    tone: string;
    custom_prompt: string;
    language: string;
    auto_mode: boolean;
    approval_required: boolean;
    max_responses_per_run: number;
    max_comments_per_hour: number;
    working_hours_start: string;


    working_hours_end: string;
    working_days: number[];
    respond_to_praise: boolean;

    respond_to_questions: boolean;
    respond_to_neutral: boolean;
    respond_to_criticism: boolean;
}

export default function AgentsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [config, setConfig] = useState<AgentConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const res = await api.get("/integrations");
            setIntegrations(res.data);
            if (res.data.length > 0) setSelectedId(res.data[0].id);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedId) fetchConfig(selectedId);
    }, [selectedId]);

    const fetchConfig = async (id: string) => {
        try {
            const res = await api.get(`/agents/config/${id}`);
            setConfig(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!selectedId || !config) return;
        setSaving(true);
        setMessage(null);
        try {
            await api.patch(`/agents/config/${selectedId}`, config);
            setMessage({ type: 'success', text: "Configurações do agente salvas!" });
        } catch (error) {
            setMessage({ type: 'error', text: "Erro ao salvar configurações." });
        } finally {
            setSaving(false);
        }
    };

    const toggleAgent = async () => {
        if (!selectedId) return;
        try {
            const res = await api.patch(`/agents/toggle/${selectedId}`);
            setIntegrations(prev => prev.map(i => i.id === selectedId ? { ...i, is_active: res.data.is_active } : i));
        } catch (error) {
            alert("Erro ao alterar estado do agente");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium">Carregando seus agentes...</p>
        </div>
    );

    const activeIntegration = integrations.find(i => i.id === selectedId);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Cpu className="text-indigo-400" />
                        Seus Agentes de IA
                    </h1>
                    <p className="text-gray-400">Configure como sua IA interage em cada canal conectado</p>
                </div>

                {selectedId && (
                    <button
                        onClick={toggleAgent}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg ${activeIntegration?.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                            }`}
                    >
                        <Power size={20} />
                        {activeIntegration?.is_active ? "Agente Ligado" : "Agente Desligado"}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Seleção de Canal */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 px-2">Canais Conectados</h3>
                    <div className="space-y-2">
                        {integrations.map((i) => (
                            <button
                                key={i.id}
                                onClick={() => setSelectedId(i.id)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${selectedId === i.id
                                    ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                                    : "bg-gray-900/50 border-white/5 text-gray-400 hover:border-white/10"
                                    }`}
                            >
                                {i.platform === 'youtube' ? <Youtube size={18} className="text-red-500" /> : <Instagram size={18} className="text-pink-500" />}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{i.channel_name}</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-50">{i.platform}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                            <Sparkles size={14} /> Sugestão de IA
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed italic">
                            "Personas detalhadas tendem a gerar 40% mais engajamento positivo."
                        </p>
                    </div>
                </div>

                {/* Configurações */}
                <div className="lg:col-span-3 space-y-8">
                    {config ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-10"
                        >
                            {/* Persona Selection */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                        <Sparkles size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold">Personalidade & Persona</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Nome da Persona</label>
                                        <input
                                            type="text"
                                            value={config.persona_name}
                                            onChange={(e) => setConfig({ ...config, persona_name: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                            placeholder="Ex: Assistente VIP"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Tom de Voz</label>
                                        <select
                                            value={config.tone}
                                            onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                        >
                                            <option value="casual">Casual & Amigável</option>
                                            <option value="formal">Formal & Estruturado</option>
                                            <option value="funny">Divertido & Sarcástico</option>
                                            <option value="empathetic">Empático & Atencioso</option>
                                            <option value="professional">Profissional & Direto</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Prompt Customizado (Briefing)</label>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/50">IA Prompt Engineering</span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={config.custom_prompt}
                                        onChange={(e) => setConfig({ ...config, custom_prompt: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-gray-300 leading-relaxed"
                                        placeholder="Instruções extras para a IA... Ex: Sempre use emojis de fogo e não fale sobre política."
                                    />
                                </div>
                            </section>

                            {/* Comportamento */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                                        <Settings2 size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold">Inteligência de Resposta</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'respond_to_praise', label: 'Elogios & Fans' },
                                        { key: 'respond_to_questions', label: 'Dúvidas & Perguntas' },
                                        { key: 'respond_to_neutral', label: 'Comentários Neutros' },
                                        { key: 'respond_to_criticism', label: 'Críticas & Feedbacks' }
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => setConfig({ ...config, [item.key]: !config[item.key as keyof AgentConfig] })}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config[item.key as keyof AgentConfig]
                                                ? "bg-indigo-500/5 border-indigo-500/20 text-white"
                                                : "bg-black/20 border-white/5 text-gray-500"
                                                }`}
                                        >
                                            <span className="text-sm font-bold">{item.label}</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${config[item.key as keyof AgentConfig] ? "bg-indigo-500" : "bg-gray-800"
                                                }`}>
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config[item.key as keyof AgentConfig] ? "right-1" : "left-1"
                                                    }`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Limites de Cota */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                                        <ShieldAlert size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold">Limites & Segurança (Quotas)</h2>
                                </div>

                                <div className="bg-black/30 border border-white/5 p-8 rounded-3xl space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-400">Limite por Hora</label>
                                                <span className="text-xs font-black text-indigo-400">{config.max_comments_per_hour} interações</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={config.max_comments_per_hour}
                                                onChange={(e) => setConfig({ ...config, max_comments_per_hour: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                            <p className="text-[10px] text-gray-500">Máximo de comentários que o agente processará em 60 minutos.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                                        <Package size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Limite do Plano</p>
                                                        <p className="text-sm text-gray-300 font-medium">Cota Diária de Respostas</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-indigo-400">Ativo</span>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Gerenciado pelo Sistema</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 px-2 italic">O teto diário é definido pela sua assinatura administrativa para garantir a integridade do serviço.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Agendamento */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                        <Clock size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold">Janela de Atendimento</h2>
                                </div>

                                <div className="bg-black/30 border border-white/5 p-8 rounded-3xl space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">Início das Operações</label>
                                            <input
                                                type="time"
                                                value={config.working_hours_start}
                                                onChange={(e) => setConfig({ ...config, working_hours_start: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">Fim das Operações</label>
                                            <input
                                                type="time"
                                                value={config.working_hours_end}
                                                onChange={(e) => setConfig({ ...config, working_hours_end: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Dias de Funcionamento</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, idx) => {
                                                const isActive = config.working_days.includes(idx);
                                                return (
                                                    <button
                                                        key={day}
                                                        onClick={() => {
                                                            const newDays = isActive
                                                                ? config.working_days.filter(d => d !== idx)
                                                                : [...config.working_days, idx].sort();
                                                            setConfig({ ...config, working_days: newDays });
                                                        }}
                                                        className={`flex-1 min-w-[60px] py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border ${isActive
                                                            ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                                                            : "bg-black/40 border-white/5 text-gray-500 hover:border-white/20"
                                                            }`}
                                                    >
                                                        {day}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-indigo-500/5 rounded-2xl">
                                        <Info size={16} className="text-indigo-400 mt-0.5" />
                                        <p className="text-[11px] text-gray-500 leading-relaxed">
                                            Fora destes horários, o agente entrará em modo de repouso e não processará novos comentários. O fuso horário oficial é <span className="text-indigo-300 font-bold">America/Sao_Paulo</span>.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Automação */}

                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg">
                                        <History size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold">Modo de Automação</h2>
                                </div>

                                <div className="bg-black/30 border border-white/5 p-6 rounded-3xl space-y-6">
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => setConfig({ ...config, auto_mode: !config.auto_mode })}
                                            className={`w-14 h-7 rounded-full relative shrink-0 transition-colors mt-1 ${config.auto_mode ? "bg-indigo-500" : "bg-gray-800"
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${config.auto_mode ? "right-1" : "left-1"
                                                }`} />
                                        </button>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Piloto Automático Integral</h4>
                                            <p className="text-sm text-gray-500 mt-1">A IA envia as respostas imediatamente sem filtrar por aprovação humana.</p>
                                        </div>
                                    </div>

                                    {!config.auto_mode && (
                                        <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => setConfig({ ...config, approval_required: !config.approval_required })}
                                                className={`w-14 h-7 rounded-full relative shrink-0 transition-colors mt-1 ${config.approval_required ? "bg-amber-500" : "bg-gray-800"
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${config.approval_required ? "right-1" : "left-1"
                                                    }`} />
                                            </button>
                                            <div>
                                                <h4 className="font-bold text-gray-200">Revisão Humana Obrigatória</h4>
                                                <p className="text-sm text-gray-500 mt-1">Toda resposta gerada cairá em uma fila para seu "OK" antes de ser postada.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Footer do Form */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                                <AnimatePresence>
                                    {message && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                                                }`}
                                        >
                                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                            {message.text}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    Salvar Configurações do Agente
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-gray-900/30 border border-dashed border-white/10 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-3xl flex items-center justify-center text-gray-600 mb-6">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-300">Nenhum canal selecionado</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">Escolha um canal na barra lateral para configurar o comportamento do seu agente de IA.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
