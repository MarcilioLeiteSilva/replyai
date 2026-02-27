"use client";
import { useEffect, useState } from "react";
import { integrationsApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Youtube, Plus, Trash2, Play, Settings, CheckCircle, XCircle } from "lucide-react";

interface Integration {
    id: string;
    platform: string;
    channel_name: string;
    channel_avatar: string;
    is_active: boolean;
    last_run_at: string;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(false);

    const load = () => integrationsApi.list().then((r) => setIntegrations(r.data)).catch(() => { });

    useEffect(() => { load(); }, []);

    const connectYouTube = async () => {
        setLoading(true);
        try {
            const { data } = await integrationsApi.youtubeConnect();
            window.location.href = data.auth_url;
        } catch { setLoading(false); }
    };

    const deleteIntegration = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover esta integração?")) return;
        await integrationsApi.delete(id);
        load();
    };

    const platformIcon: Record<string, React.ReactNode> = {
        youtube: <Youtube size={20} className="text-red-400" />,
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Integrações</h1>
                    <p className="text-gray-400">Conecte suas redes sociais para automatizar respostas</p>
                </div>
            </div>

            {/* Connect buttons */}
            <div className="glass-card p-6">
                <h2 className="font-semibold mb-4">Adicionar integração</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { platform: "youtube", label: "YouTube", icon: <Youtube size={22} className="text-red-400" />, available: true, action: connectYouTube },
                        { platform: "instagram", label: "Instagram", icon: <span className="text-pink-400 text-lg">📸</span>, available: false },
                        { platform: "tiktok", label: "TikTok", icon: <span className="text-cyan-400 text-lg">🎵</span>, available: false },
                        { platform: "facebook", label: "Facebook", icon: <span className="text-blue-400 text-lg">📘</span>, available: false },
                    ].map((p) => (
                        <button
                            key={p.platform}
                            onClick={p.available ? p.action : undefined}
                            disabled={!p.available || loading}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${p.available
                                    ? "border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/5 text-gray-300"
                                    : "border-white/5 text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            {p.icon}
                            {p.label}
                            {!p.available && <span className="text-xs text-gray-600">Em breve</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active integrations */}
            <div>
                <h2 className="font-semibold text-lg mb-4">Integrações ativas ({integrations.length})</h2>
                {integrations.length === 0 ? (
                    <div className="glass-card p-10 text-center text-gray-500">
                        <Plus size={32} className="mx-auto mb-3 opacity-30" />
                        <p>Nenhuma integração ainda. Conecte uma rede social acima.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {integrations.map((int) => (
                            <motion.div
                                key={int.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-5 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(31,41,55,0.8)" }}>
                                    {int.channel_avatar
                                        ? <img src={int.channel_avatar} alt="" className="w-10 h-10 rounded-full" />
                                        : platformIcon[int.platform] || <span>🔗</span>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{int.channel_name || int.platform}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {int.is_active
                                            ? <span className="badge badge-success"><CheckCircle size={10} />Ativo</span>
                                            : <span className="badge badge-danger"><XCircle size={10} />Inativo</span>
                                        }
                                        {int.last_run_at && (
                                            <span className="text-xs text-gray-500">
                                                Último run: {new Date(int.last_run_at).toLocaleDateString("pt-BR")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        title="Configurar agente"
                                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                        onClick={() => window.location.href = `/dashboard/integrations/${int.id}/config`}
                                    >
                                        <Settings size={16} />
                                    </button>
                                    <button
                                        title="Remover"
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        onClick={() => deleteIntegration(int.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
