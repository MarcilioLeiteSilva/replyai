"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    MessageSquare, CheckCircle2, XCircle, Search, Filter,
    Youtube, Instagram, ExternalLink, Clock, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
    id: string;
    video_title: string;
    text: string;
    author_name: string;
    author_profile_image?: string;
    platform: string;
    category?: string;
    created_at: string;
    permalink?: string;
    response?: {
        id: string;
        text: string;
        status: 'pending' | 'sent' | 'rejected' | 'failed';
        sent_at?: string;
    };
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [stats, setStats] = useState<any>(null);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const [commentsRes, statsRes] = await Promise.all([
                api.get("/comments", {
                    params: { search, status: statusFilter }
                }),
                api.get("/comments/stats")
            ]);
            setComments(commentsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Erro ao buscar comentários", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchComments();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/comments/${id}/approve`);
            fetchComments();
        } catch (error) {
            console.error("Erro ao aprovar resposta", error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.patch(`/comments/${id}/reject`);
            fetchComments();
        } catch (error) {
            console.error("Erro ao rejeitar resposta", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Comentários</h1>
                    <p className="text-gray-400">Gerencie as interações capturadas pelos seus agentes</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar nos comentários..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-64 bg-gray-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-900/50 border border-white/10 rounded-xl py-2 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm"
                    >
                        <option value="">Todos os Status</option>
                        <option value="pending">Pendentes</option>
                        <option value="sent">Enviados</option>
                        <option value="rejected">Rejeitados</option>
                    </select>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Interações", value: stats.total_comments, icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                        { label: "Respostas Enviadas", value: stats.total_responses, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "Taxa de Resposta", value: `${stats.response_rate}%`, icon: Filter, color: "text-amber-400", bg: "bg-amber-500/10" },
                        { label: "Integrações Ativas", value: stats.active_integrations, icon: Youtube, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                    ].map((s, idx) => (
                        <div key={idx} className="bg-gray-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                                <s.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
                                <p className="text-xl font-bold">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-gray-400 font-medium">Sincronizando interações...</p>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <motion.div
                            layout
                            key={comment.id}
                            className={`bg-gray-900/50 border border-white/10 rounded-2xl p-6 transition-all group hover:border-white/20`}
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Autor & Plataforma */}
                                <div className="flex md:flex-col items-center md:items-start gap-4 md:w-48 shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                                        {comment.author_profile_image ? (
                                            <img src={comment.author_profile_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-indigo-400">
                                                {comment.author_name?.[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{comment.author_name}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                            {comment.platform === 'youtube' ? <Youtube size={12} className="text-red-500" /> : <Instagram size={12} className="text-pink-500" />}
                                            <span className="capitalize">{comment.platform}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Conteúdo */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <p className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {comment.video_title}
                                            </p>
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-200 leading-relaxed italic border-l-2 border-white/5 pl-4 py-1">
                                            "{comment.text}"
                                        </p>
                                    </div>

                                    {/* Resposta Inteligente */}
                                    {comment.response ? (
                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Resposta da IA</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {comment.response.status === 'sent' && (
                                                        <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-emerald-500/20">
                                                            <CheckCircle2 size={10} /> Enviada
                                                        </span>
                                                    )}
                                                    {comment.response.status === 'pending' && (
                                                        <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-amber-500/20">
                                                            <Clock size={10} /> Aguardando Aprovação
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-indigo-200/80">
                                                {comment.response.text}
                                            </p>

                                            {comment.response.status === 'pending' && (
                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={() => handleApprove(comment.id)}
                                                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                                                    >
                                                        Aprovar & Enviar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(comment.id)}
                                                        className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 py-2 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                                            <XCircle size={14} />
                                            Nenhum gatilho de resposta ativado para este comentário.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="bg-gray-900/30 border border-dashed border-white/10 rounded-3xl py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-gray-800 flex items-center justify-center text-gray-600">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-300">Nenhum comentário encontrado</p>
                            <p className="text-gray-500 max-w-sm mx-auto">Tente ajustar seus filtros ou aguarde os agentes processarem novas interações.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
