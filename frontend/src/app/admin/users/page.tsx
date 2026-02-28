"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    Users, ShieldCheck, UserCheck, UserX, Crown,
    Search, Filter, Mail, Calendar, MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserInfo {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
    plan?: { name: string };
}

export default function ManageUsersPage() {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Erro ao carregar usuários", error);
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
            alert("Erro ao alterar status");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Gerenciar Usuários</h1>
                    <p className="text-gray-400">Controle de acesso e monitoramento de contas</p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Nome ou e-mail..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-80 bg-gray-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="bg-gray-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5">Usuário</th>
                                <th className="px-8 py-5">Plano Atual</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Cadastro</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredUsers.map((u, idx) => (
                                    <motion.tr
                                        key={u.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 border border-indigo-500/20 shadow-inner">
                                                    {u.name[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold flex items-center gap-1.5 text-gray-200">
                                                        {u.name}
                                                        {u.is_admin && <Crown size={12} className="text-amber-400" />}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail size={10} /> {u.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 capitalize">
                                                {u.plan?.name || "Free"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {u.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                                    Bloqueado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <Calendar size={12} />
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {!u.is_admin && (
                                                <button
                                                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                    className={`p-2.5 rounded-2xl transition-all shadow-lg ${u.is_active
                                                            ? "text-red-400 hover:bg-red-500/10 hover:shadow-red-500/5 border border-transparent hover:border-red-500/20"
                                                            : "text-emerald-400 hover:bg-emerald-500/10 hover:shadow-emerald-500/5 border border-transparent hover:border-emerald-500/20"
                                                        }`}
                                                    title={u.is_active ? "Bloquear Acesso" : "Desbloquear Acesso"}
                                                >
                                                    {u.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
