"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    CreditCard, ShoppingCart, DollarSign,
    ArrowUpCircle, Download, CheckCircle2,
    XCircle, Clock, Filter, Search
} from "lucide-react";
import { motion } from "framer-motion";

interface Payment {
    id: string;
    user_name: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed' | 'canceled';
    gateway: string;
    created_at: string;
    plan_name: string;
}

export default function ManagePaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Em ambiente real, criaremos endpoint /admin/payments
            // setPayments(res.data);
            setPayments([
                { id: "1", user_name: "Marcílio Silva", amount: 149.0, currency: "BRL", status: 'paid', gateway: "stripe", created_at: new Date().toISOString(), plan_name: "Pro" },
                { id: "2", user_name: "Ana Costa", amount: 49.0, currency: "BRL", status: 'pending', gateway: "asaas", created_at: new Date().toISOString(), plan_name: "Starter" },
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1 italic tracking-tighter uppercase">Pagamentos & Receita</h1>
                    <p className="text-gray-400">Controle financeiro e logs de faturamento</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest outline-none hover:bg-emerald-500/20 transition-all">
                        <Download size={18} /> Exportar CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Receita Mensal (MRR)", value: "R$ 1.250", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Churn Rate", value: "2.5%", icon: ArrowUpCircle, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    { label: "Total Pago", value: "R$ 15.800", icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-gray-900/40 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-lg`}>
                            <stat.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <CreditCard size={20} className="text-indigo-400" />
                        Histórico de Faturas
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Filtrar por nome..."
                                className="bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-indigo-500/30 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5">Assinante</th>
                                <th className="px-8 py-5">Valor / Moeda</th>
                                <th className="px-8 py-5">Gateway / Plano</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right flex items-center justify-end gap-1">Data <Clock size={12} /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-200">{p.user_name}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">ID: {p.id.padStart(6, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-emerald-400">{p.currency} {p.amount.toFixed(2)}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Mensalidade</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase italic">{p.gateway}</span>
                                            <div className="w-1 h-1 bg-gray-700 rounded-full" />
                                            <span className="text-xs font-medium text-gray-500 capitalize">{p.plan_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {p.status === 'paid' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">
                                                <CheckCircle2 size={12} /> Confirmado
                                            </span>
                                        )}
                                        {p.status === 'pending' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/10">
                                                <Clock size={12} /> Pendente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
