"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    Package, Plus, Edit2, Trash2,
    CheckCircle2, AlertCircle, ShoppingCart,
    Settings2, Layers, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlanInfo {
    id: string;
    slug: string;
    name: string;
    price_monthly: number;
    max_integrations: number;
    max_responses_per_day: number;
    max_personas: number;
    is_active: boolean;
}

export default function ManagePlansPage() {
    const [plans, setPlans] = useState<PlanInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get("/users/plans"); // Reutilizando para listar
            setPlans(res.data);
        } catch (error) {
            console.error("Erro ao carregar planos", error);
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
                    <h1 className="text-3xl font-bold mb-1 italic tracking-tighter uppercase">Planos & Preços</h1>
                    <p className="text-gray-400">Configure os limites e valores das assinaturas do SaaS</p>
                </div>

                <button
                    disabled
                    className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest opacity-50 cursor-not-allowed"
                    title="Criação manual via interface em breve"
                >
                    <Plus size={18} /> Novo Plano
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />

                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-white/5 rounded-2xl text-indigo-400">
                                    <Layers size={22} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-gray-500">
                                    ID: {plan.slug}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-1 tracking-tight">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-sm font-bold text-gray-400 font-mono">R$</span>
                                <span className="text-4xl font-black">{plan.price_monthly.toFixed(0)}</span>
                                <span className="text-xs font-bold text-gray-500 uppercase">/mês</span>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-gray-400">Integrações:</span>
                                    <span className="text-gray-200">{plan.max_integrations === 999 ? "Ilimitadas" : plan.max_integrations}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-gray-400">Mensagens/dia:</span>
                                    <span className="text-gray-200 font-mono">{plan.max_responses_per_day}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-gray-400">Personas:</span>
                                    <span className="text-gray-200">{plan.max_personas}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5">
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-500/10">
                                    <Trash2 size={14} /> Pausar
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Informação */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-amber-500 mb-1">Nota sobre Webhooks & Gateways</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Alterar o `slug` ou `id` de um plano aqui **não** altera o ID correspondente no Stripe ou Asaas. Certifique-se de sincronizar manualmente os preços nos gateways para evitar erros de checkout.
                    </p>
                </div>
            </div>
        </div>
    );
}
