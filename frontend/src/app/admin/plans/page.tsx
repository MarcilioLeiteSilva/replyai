"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    Package, Plus, Edit2, Trash2,
    CheckCircle2, AlertCircle, ShoppingCart,
    Settings2, Layers, DollarSign, X
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<PlanInfo> | null>(null);

    const fetchData = async () => {
        try {
            const res = await api.get("/users/plans");
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPlan?.id) {
                await api.patch(`/admin/plans/${editingPlan.id}`, editingPlan);
            } else {
                await api.post("/admin/plans", editingPlan);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Erro ao salvar o plano. Se for um novo plano, verifique se o slug já existe.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir ou pausar este plano? Esta exclusão pode falhar se houver usuários usando o plano. Recomenda-se apenas inativar.")) return;
        try {
            await api.delete(`/admin/plans/${id}`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.detail || "Erro ao excluir o plano.");
        }
    };

    const openCreateModal = () => {
        setEditingPlan({
            slug: "",
            name: "",
            price_monthly: 0,
            max_integrations: 1,
            max_responses_per_day: 20,
            max_personas: 1,
            is_active: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (plan: PlanInfo) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1 italic tracking-tighter uppercase">Planos & Preços</h1>
                    <p className="text-gray-400">Configure os limites e valores das assinaturas do SaaS</p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
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
                                    SLUG: {plan.slug}
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
                                <button
                                    onClick={() => openEditModal(plan)}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-500/10"
                                >
                                    <Trash2 size={14} /> Excluir
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
                        Alterar o `slug` ou `id` de um plano aqui **não** altera o ID correspondente no Stripe ou Asaas. Certifique-se de sincronizar manualmente os preços nos gateways para evitar erros de checkout. **Se atente aos slugs hardcoded no banco de dados para os planos nativos (free, starter, pro, agency)**.
                    </p>
                </div>
            </div>

            {/* Modal de Criar/Editar Plano */}
            <AnimatePresence>
                {isModalOpen && editingPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">
                                    {editingPlan.id ? "Editar Plano" : "Criar Novo Plano"}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 font-medium">Nome do Plano</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingPlan.name || ""}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 font-medium">Slug (único, minúsculas, sem espaços)</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingPlan.slug || ""}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                                        placeholder="ex: enterprise-plan"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 font-medium">Preço Mensal (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={editingPlan.price_monthly ?? 0}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: parseFloat(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 font-medium">Max Integrações</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={editingPlan.max_integrations ?? 1}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, max_integrations: parseInt(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 font-medium">Max Respostas/dia</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={editingPlan.max_responses_per_day ?? 20}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, max_responses_per_day: parseInt(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 font-medium">Max Personas</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={editingPlan.max_personas ?? 1}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, max_personas: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Salvar Plano
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
