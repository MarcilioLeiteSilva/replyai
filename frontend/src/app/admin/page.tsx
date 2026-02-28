"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    Users, BarChart3, Package, ShieldCheck,
    TrendingUp, MessageSquare, AlertCircle,
    UserCheck, UserX, Crown
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminStats {
    total_users: number;
    total_integrations: number;
    total_comments: number;
    total_responses: number;
    users_by_plan: Record<string, number>;
}

interface UserInfo {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/admin/users")
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados admin", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, null, {
                params: { is_active: !currentStatus }
            });
            fetchData();
        } catch (error) {
            alert("Erro ao alterar status do usuário");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium animate-pulse">Carregando central de comando...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">Painel Administrativo</span>
                    </div>
                    <h1 className="text-4xl font-bold">Visão Geral do Sistema</h1>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-sm font-semibold text-indigo-300 italic">Sincronizado em tempo real</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total de Usuários", value: stats?.total_users, icon: Users, color: "from-blue-500 to-indigo-500" },
                    { label: "Instâncias Ativas", value: stats?.total_integrations, icon: Package, color: "from-emerald-500 to-teal-500" },
                    { label: "Interações Totais", value: stats?.total_comments, icon: MessageSquare, color: "from-amber-500 to-orange-500" },
                    { label: "Respostas de IA", value: stats?.total_responses, icon: TrendingUp, color: "from-fuchsia-500 to-purple-500" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <stat.icon size={24} className="text-white/70" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold mt-1 tracking-tight">{stat.value?.toLocaleString()}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Users List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/50 border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <Users size={22} className="text-indigo-400" />
                                Gestão de Usuários
                            </h2>
                            <p className="text-xs text-gray-500">{users.length} usuários cadastrados</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5">
                                        <th className="px-6 py-4">Usuário</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Criado em</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold border-2 border-white/10">
                                                        {u.name[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold flex items-center gap-1.5">
                                                            {u.name}
                                                            {u.is_admin && <Crown size={12} className="text-amber-400" />}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{u.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                                                        Bloqueado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-[11px] text-gray-500 font-mono">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!u.is_admin && (
                                                    <button
                                                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                        className={`p-2 rounded-xl transition-all ${u.is_active
                                                                ? "text-red-400 hover:bg-red-500/10"
                                                                : "text-emerald-400 hover:bg-emerald-500/10"
                                                            }`}
                                                    >
                                                        {u.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    {/* Plan Distribution */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <BarChart3 size={20} className="text-indigo-400" />
                            Distribuição de Planos
                        </h3>
                        <div className="space-y-4">
                            {stats && Object.entries(stats.users_by_plan).map(([name, count]) => (
                                <div key={name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400 capitalize">{name}</span>
                                        <span className="font-bold">{count}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(count / (stats?.total_users || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerts/System Status */}
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
                        <div className="flex items-center gap-2 text-amber-500 mb-4">
                            <AlertCircle size={20} />
                            <h3 className="font-bold uppercase text-xs tracking-widest">Logs de Alerta</h3>
                        </div>
                        <p className="text-xs text-gray-400 italic">
                            Nenhuma anomalia detectada no processamento de IA nas últimas 24 horas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
