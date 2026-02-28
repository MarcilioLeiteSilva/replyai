"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Server, Database, Activity, CheckCircle2, XCircle, RefreshCw, Cpu } from "lucide-react";

interface SystemStatus {
    api: string;
    database: string;
    celery_workers: string;
    scheduler: string;
}

export default function SystemStatusPage() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/system-status");
            setStatus(res.data);
        } catch (error) {
            console.error("Erro ao buscar status do sistema", error);
            setStatus({
                api: "offline",
                database: "unknown",
                celery_workers: "unknown",
                scheduler: "unknown"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const StatusCard = ({ title, statusValue, icon: Icon, description }: { title: string, statusValue: string, icon: any, description: string }) => {
        const isOnline = statusValue === "online" || statusValue === "active";
        return (
            <div className="bg-gray-900/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-200">{title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        </div>
                    </div>
                    <div>
                        {isOnline ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
                                <CheckCircle2 size={14} /> Online
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-widest">
                                <XCircle size={14} /> Offline
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Activity className="text-indigo-400" />
                        Status do Sistema
                    </h1>
                    <p className="text-gray-400">Monitore a saúde dos serviços essenciais em tempo real.</p>
                </div>
                <button
                    onClick={fetchStatus}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all disabled:opacity-50"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    Atualizar Agora
                </button>
            </div>

            {loading && !status ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : status ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatusCard
                        title="API Principal"
                        statusValue={status.api}
                        icon={Server}
                        description="Servidor responsável por receber requisições do frontend."
                    />
                    <StatusCard
                        title="Banco de Dados"
                        statusValue={status.database}
                        icon={Database}
                        description="Conexão com o PostgreSQL (Leitura e Escrita)."
                    />
                    <StatusCard
                        title="Celery Workers (Agentes)"
                        statusValue={status.celery_workers}
                        icon={Cpu}
                        description="Processamento em segundo plano. Responsável por postar no YouTube."
                    />
                    <StatusCard
                        title="Agendador (Beat)"
                        statusValue={status.scheduler}
                        icon={Activity}
                        description="Gatilho que desperta os agentes a cada 5 minutos."
                    />
                </div>
            ) : null}

            <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl">
                <h4 className="font-bold text-indigo-400 mb-2">Importante para Diagnósticos</h4>
                <p className="text-sm text-indigo-300/70 leading-relaxed md:w-3/4">
                    Se a caixa "Celery Workers" estiver vermelha, significa que o Agente da IA está inativo e nenhum comentário será respondido automaticamente. Reinicie o serviço `worker` no Easypanel.
                </p>
            </div>
        </div>
    );
}
