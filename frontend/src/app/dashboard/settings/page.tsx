"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Save, User, Mail, Shield, Trash2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const { user, fetchMe } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await api.patch("/users/me", formData);
            await fetchMe();
            setMessage({ type: 'success', text: "Perfil atualizado com sucesso!" });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || "Erro ao atualizar perfil" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Configurações</h1>
                <p className="text-gray-400 text-lg">Gerencie sua conta e preferências</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Perfil */}
                <div className="md:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <User size={24} />
                            </div>
                            <h2 className="text-xl font-semibold">Perfil</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">E-mail</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-gray-500 cursor-not-allowed outline-none"
                                        placeholder="vendas@exemplo.com"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-medium">{message.text}</span>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-500/25"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Segurança */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-xl font-semibold">Segurança</h2>
                        </div>

                        <p className="text-gray-400 text-sm mb-6">Em breve: Alteração de senha e autenticação em dois fatores.</p>

                        <button disabled className="text-indigo-400 hover:text-indigo-300 font-medium text-sm opacity-50 cursor-not-allowed">
                            Alterar senha segura →
                        </button>
                    </motion.div>
                </div>

                {/* Lateral */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6"
                    >
                        <div className="flex items-center gap-3 text-red-400 mb-4">
                            <Trash2 size={20} />
                            <h3 className="font-bold">Zona de Perigo</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">Desativar sua conta irá pausar todas as integrações e agentes ativos imediatamente.</p>
                        <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-2xl text-sm font-semibold transition-all">
                            Desativar Conta
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
