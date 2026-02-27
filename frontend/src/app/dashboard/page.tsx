"use client";
import { useEffect, useState } from "react";
import { commentsApi, agentsApi, integrationsApi } from "@/lib/api";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, TrendingUp, Link2, Play, Loader2 } from "lucide-react";

interface Stats {
    today_comments: number;
    today_responses: number;
    total_comments: number;
    total_responses: number;
    response_rate: number;
    active_integrations: number;
}

interface Comment {
    id: string;
    author: string;
    text: string;
    category: string;
    response: { text: string; status: string } | null;
    created_at: string;
}

interface Integration {
    id: string;
    platform: string;
    channel_name: string;
    is_active: boolean;
}

const categoryBadge: Record<string, string> = {
    elogio: "badge badge-success",
    duvida: "badge badge-info",
    critica: "badge badge-warning",
    spam: "badge badge-danger",
    neutro: "badge badge-neutral",
    ofensa: "badge badge-danger",
    discordancia: "badge badge-warning",
    pedido_de_conteudo: "badge badge-info",
};

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [runningTask, setRunningTask] = useState<Record<string, string>>({});

    useEffect(() => {
        commentsApi.stats().then((r) => setStats(r.data)).catch(() => { });
        commentsApi.list({ limit: 10 }).then((r) => setComments(r.data)).catch(() => { });
        integrationsApi.list().then((r) => setIntegrations(r.data)).catch(() => { });
    }, []);

    const runAgent = async (integrationId: string) => {
        try {
            const { data } = await agentsApi.run(integrationId);
            setRunningTask((p) => ({ ...p, [integrationId]: data.task_id }));
            // Poll status
            const interval = setInterval(async () => {
                const s = await agentsApi.status(data.task_id);
                if (["SUCCESS", "FAILURE"].includes(s.data.status)) {
                    clearInterval(interval);
                    setRunningTask((p) => { const n = { ...p }; delete n[integrationId]; return n; });
                    commentsApi.stats().then((r) => setStats(r.data));
                    commentsApi.list({ limit: 10 }).then((r) => setComments(r.data));
                }
            }, 3000);
        } catch { }
    };

    const statCards = stats ? [
        { icon: MessageSquare, label: "Comentários hoje", value: stats.today_comments, color: "#6366f1" },
        { icon: CheckCircle, label: "Respostas hoje", value: stats.today_responses, color: "#22c55e" },
        { icon: TrendingUp, label: "Taxa de resposta", value: `${stats.response_rate}%`, color: "#06b6d4" },
        { icon: Link2, label: "Integrações ativas", value: stats.active_integrations, color: "#f59e0b" },
    ] : [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                <p className="text-gray-400">Visão geral das suas automações</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-5"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                                <s.icon size={18} style={{ color: s.color }} />
                            </div>
                            <span className="text-gray-400 text-sm">{s.label}</span>
                        </div>
                        <p className="text-3xl font-bold">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Run */}
            {integrations.length > 0 && (
                <div className="glass-card p-6">
                    <h2 className="font-semibold text-lg mb-4">Executar agente agora</h2>
                    <div className="flex flex-wrap gap-3">
                        {integrations.map((int) => {
                            const isRunning = !!runningTask[int.id];
                            return (
                                <button
                                    key={int.id}
                                    onClick={() => runAgent(int.id)}
                                    disabled={isRunning}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                        background: isRunning ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.15)",
                                        border: "1px solid rgba(99,102,241,0.3)",
                                        color: "#a5b4fc",
                                    }}
                                >
                                    {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                    {int.channel_name || int.platform}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent comments */}
            <div className="glass-card p-6">
                <h2 className="font-semibold text-lg mb-4">Comentários recentes</h2>
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                        Nenhum comentário ainda. Conecte uma rede social e execute o agente.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {comments.map((c) => (
                            <div key={c.id} className="p-4 rounded-xl" style={{ background: "rgba(31,41,55,0.5)" }}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {c.author?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <span className="text-sm font-medium">{c.author || "Anônimo"}</span>
                                    </div>
                                    {c.category && (
                                        <span className={categoryBadge[c.category] || "badge badge-neutral"}>{c.category}</span>
                                    )}
                                </div>
                                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{c.text}</p>
                                {c.response && (
                                    <div className="pl-3 border-l-2 border-indigo-500/40">
                                        <p className="text-indigo-300 text-xs">{c.response.text}</p>
                                        <span className={`text-xs mt-1 ${c.response.status === "sent" ? "text-green-400" : c.response.status === "pending" ? "text-yellow-400" : "text-gray-400"}`}>
                                            {c.response.status === "sent" ? "✅ Enviado" : c.response.status === "pending" ? "⏳ Aguardando aprovação" : c.response.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
