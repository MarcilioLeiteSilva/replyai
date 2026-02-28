"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    MessageSquare, CheckCircle2, XCircle, Search, Filter,
    Youtube, Instagram, ExternalLink, Clock, AlertCircle,
    Edit3, Trash2, Send, Check
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
    const [activeTab, setActiveTab] = useState<string>("pending"); // Default to pending queue
    const [stats, setStats] = useState<any>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    const fetchComments = async () => {
        setLoading(true);
        try {
            const [commentsRes, statsRes] = await Promise.all([
                api.get("/comments", {
                    params: {
                        search,
                        status: activeTab === 'all' ? undefined : activeTab
                    }
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
    }, [search, activeTab]);

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/comments/${id}/approve`);
            setComments(prev => prev.filter(c => c.id !== id)); // Remove from current view if was pending
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

    const startEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditText(comment.response?.text || "");
    };

    const saveEdit = async (id: string) => {
        try {
            await api.patch(`/comments/${id}/edit`, null, { params: { text: editText } });
            setEditingId(null);
            fetchComments();
        } catch (error) {
            alert("Erro ao salvar edição");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Central de Interações</h1>
                    <p className="text-gray-400">Gerencie e aprove as respostas geradas pela sua IA</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-900/50 p-1.5 rounded-2xl border border-white/5">
                    {[
                        { id: 'pending', label: 'Fila de Aprovação', icon: Clock },
                        { id: 'sent', label: 'Enviados', icon: CheckCircle2 },
                        { id: 'all', label: 'Todos', icon: MessageSquare },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtro de Busca */}
            <div className="relative group max-w-md">
                <Search size={18} className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Pesquisar por texto ou autor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-900/30 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                />
            </div>

            {/* Comments List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sincronizando Banco de Dados</p>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <motion.div
                            layout
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all relative group overflow-hidden ${comment.response?.status === 'pending' ? 'ring-1 ring-amber-500/20' : ''
                                }`}
                        >
                            {comment.response?.status === 'pending' && (
                                <div className="absolute top-0 right-0 px-6 py-2 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-3xl border-l border-b border-amber-500/20">
                                    Ação Necessária
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Lateral: Info Autor */}
                                <div className="md:w-56 shrink-0 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-800 border border-white/10 shadow-inner relative group-hover:scale-105 transition-transform">
                                            {comment.author_profile_image ? (
                                                <img src={comment.author_profile_image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-xl text-indigo-400 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                                                    {comment.author_name?.[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 right-1">
                                                {comment.platform === 'youtube' ? <Youtube size={14} className="text-red-500 drop-shadow-lg" /> : <Instagram size={14} className="text-pink-500 drop-shadow-lg" />}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-200 truncate">{comment.author_name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{comment.platform}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                                        <Clock size={12} />
                                        {new Date(comment.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Conteúdo Central */}
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">
                                                {comment.video_title}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-lg leading-relaxed font-medium italic">
                                            "{comment.text}"
                                        </p>
                                    </div>

                                    {/* Box de Resposta */}
                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <SparklesIcon />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Sugestão do Agente</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {comment.response?.status === 'sent' && (
                                                    <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20">Enviada</span>
                                                )}
                                                {comment.response?.status === 'rejected' && (
                                                    <span className="text-[9px] font-black uppercase bg-red-500/10 text-red-400 px-2 py-0.5 rounded-lg border border-red-500/20">Descartada</span>
                                                )}
                                            </div>
                                        </div>

                                        {editingId === comment.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full bg-black/50 border border-indigo-500/30 rounded-xl p-4 text-sm text-indigo-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium leading-relaxed min-h-[100px]"
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest">Cancelar</button>
                                                    <button onClick={() => saveEdit(comment.id)} className="flex items-center gap-2 bg-indigo-500 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20"><Check size={14} /> Salvar Edição</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group/resp relative">
                                                <p className="text-indigo-200/90 leading-relaxed font-medium">
                                                    {comment.response?.text || "O agente não gerou resposta para este comentário."}
                                                </p>
                                                {comment.response?.status === 'pending' && (
                                                    <button
                                                        onClick={() => startEdit(comment)}
                                                        className="absolute -top-2 -right-2 p-2 bg-gray-800 rounded-lg text-gray-400 opacity-0 group-hover/resp:opacity-100 transition-all hover:text-indigo-400 hover:scale-110 shadow-xl"
                                                        title="Editar resposta"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {comment.response?.status === 'pending' && !editingId && (
                                            <div className="flex items-center gap-4 pt-4 mt-2 border-t border-white/5">
                                                <button
                                                    onClick={() => handleApprove(comment.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95"
                                                >
                                                    <Send size={16} /> Aprovar & Enviar Agora
                                                </button>
                                                <button
                                                    onClick={() => handleReject(comment.id)}
                                                    className="px-6 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-500/20"
                                                >
                                                    Descartar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="bg-gray-900/30 border border-dashed border-white/10 rounded-[40px] py-32 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 rounded-[30px] bg-gray-800/50 flex items-center justify-center text-gray-600 border border-white/5">
                            <MessageSquare size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-300">Nada por aqui no momento</h3>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">Sua fila de {activeTab === 'pending' ? 'aprovação está vazia.' : 'interações está vazia.'} Bom trabalho!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SparklesIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
            <path d="M12 3L14.5 9L21 11.5L14.5 14L12 21L9.5 14L3 11.5L9.5 9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
