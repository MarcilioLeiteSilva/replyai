"use client";
import { useEffect, useState } from "react";
import { billingApi } from "@/lib/api";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, Zap, Loader2 } from "lucide-react";

interface Plan {
    id: string;
    slug: string;
    name: string;
    price_monthly: number;
    max_integrations: number;
    max_responses_per_day: number;
    max_personas: number;
    platforms_json: string[];
}

interface Subscription {
    id: string;
    status: string;
    gateway: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    plan: Plan;
}

const GATEWAYS = [
    { id: "stripe", label: "💳 Cartão Internacional (Stripe)" },
    { id: "asaas", label: "🇧🇷 PIX / Boleto (Asaas)" },
    { id: "mp", label: "🟡 Mercado Pago" },
];

const PAYMENT_METHODS = [
    { id: "pix", label: "🔵 PIX (instantâneo)" },
    { id: "boleto", label: "📄 Boleto bancário" },
    { id: "credit_card", label: "💳 Cartão de crédito" },
];

export default function BillingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState("asaas");
    const [selectedMethod, setSelectedMethod] = useState("pix");
    const [checkoutResult, setCheckoutResult] = useState<{ pix_qr_code?: string; pix_copy_paste?: string; checkout_url?: string; boleto_url?: string } | null>(null);

    useEffect(() => {
        billingApi.plans().then((r) => setPlans(r.data)).catch(() => { });
        billingApi.subscription().then((r) => setSubscription(r.data)).catch(() => { });
    }, []);

    const handleCheckout = async (planSlug: string) => {
        if (planSlug === "free") return;
        setLoading(true);
        setCheckoutResult(null);
        try {
            const { data } = await billingApi.checkout({
                plan_slug: planSlug,
                gateway: selectedGateway,
                payment_method: selectedMethod,
            });
            if (data.checkout_url) {
                window.open(data.checkout_url, "_blank");
            } else {
                setCheckoutResult(data);
            }
        } catch (e: unknown) {
            alert((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erro no checkout");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Tem certeza que deseja cancelar sua assinatura?")) return;
        await billingApi.cancel();
        billingApi.subscription().then((r) => setSubscription(r.data));
    };

    const statusColor: Record<string, string> = {
        active: "badge-success",
        trialing: "badge-info",
        past_due: "badge-warning",
        canceled: "badge-danger",
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold mb-1">Plano & Billing</h1>
                <p className="text-gray-400">Gerencie sua assinatura e método de pagamento</p>
            </div>

            {/* Current subscription */}
            {subscription && (
                <div className="glass-card p-6">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-indigo-400" />
                        Assinatura atual
                    </h2>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-2xl font-bold">{subscription.plan?.name || "Gratuito"}</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Status: <span className={`badge ${statusColor[subscription.status] || "badge-neutral"}`}>{subscription.status}</span>
                            </p>
                            {subscription.current_period_end && (
                                <p className="text-gray-400 text-sm mt-1">
                                    {subscription.cancel_at_period_end ? "Cancela em" : "Renova em"}:{" "}
                                    {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                                </p>
                            )}
                            {subscription.gateway && (
                                <p className="text-gray-500 text-xs mt-1">Gateway: {subscription.gateway}</p>
                            )}
                        </div>
                        {subscription.status === "active" && (
                            <button onClick={handleCancel} className="text-sm text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg px-4 py-2">
                                Cancelar assinatura
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Payment method selector */}
            <div className="glass-card p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-indigo-400" />
                    Forma de pagamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {GATEWAYS.map((g) => (
                        <button
                            key={g.id}
                            onClick={() => setSelectedGateway(g.id)}
                            className={`p-3 rounded-xl text-sm text-left transition-all duration-200 border ${selectedGateway === g.id
                                    ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                                    : "border-white/10 text-gray-400 hover:border-white/20"
                                }`}
                        >
                            {g.label}
                        </button>
                    ))}
                </div>
                {selectedGateway === "asaas" && (
                    <div className="flex gap-2 flex-wrap mt-2">
                        {PAYMENT_METHODS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMethod(m.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${selectedMethod === m.id
                                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                                        : "border-white/10 text-gray-400"
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* PIX / QR result */}
            {checkoutResult?.pix_qr_code && (
                <div className="glass-card p-6 text-center">
                    <h3 className="font-semibold mb-4">Escaneie o QR Code PIX</h3>
                    <img src={`data:image/png;base64,${checkoutResult.pix_qr_code}`} alt="QR Code PIX" className="mx-auto w-48 h-48 rounded-lg" />
                    {checkoutResult.pix_copy_paste && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-400 mb-2">Ou copie o código:</p>
                            <div className="flex items-center gap-2">
                                <input readOnly value={checkoutResult.pix_copy_paste} className="input-field text-xs flex-1" />
                                <button onClick={() => navigator.clipboard.writeText(checkoutResult!.pix_copy_paste!)} className="btn-secondary text-xs py-2 px-3">Copiar</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Plans */}
            <div>
                <h2 className="font-semibold text-lg mb-4">Todos os planos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => {
                        const isCurrent = subscription?.plan?.slug === plan.slug;
                        return (
                            <motion.div key={plan.id} whileHover={{ scale: 1.02 }} className={`glass-card p-5 flex flex-col ${isCurrent ? "border-indigo-500/40 glow" : ""}`}>
                                {isCurrent && <div className="badge badge-success text-xs w-fit mb-2">Plano atual</div>}
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                <p className="text-3xl font-black gradient-text my-2">
                                    {plan.price_monthly === 0 ? "Grátis" : `R$${plan.price_monthly}`}
                                    {plan.price_monthly > 0 && <span className="text-sm text-gray-400 font-normal">/mês</span>}
                                </p>
                                <ul className="flex-1 space-y-2 my-3 text-sm text-gray-400">
                                    <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-indigo-400" />{plan.max_integrations} integração{plan.max_integrations > 1 ? "ões" : ""}</li>
                                    <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-indigo-400" />{plan.max_responses_per_day.toLocaleString()} respostas/dia</li>
                                    {plan.platforms_json?.map((p) => (
                                        <li key={p} className="flex gap-2 items-center"><CheckCircle size={14} className="text-indigo-400" />{p}</li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleCheckout(plan.slug)}
                                    disabled={isCurrent || loading || plan.slug === "free"}
                                    className={`mt-auto text-sm py-2 rounded-xl font-semibold transition-all ${isCurrent || plan.slug === "free"
                                            ? "text-gray-500 border border-white/10 cursor-not-allowed"
                                            : "btn-primary"
                                        }`}
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : isCurrent ? "Plano atual" : plan.slug === "free" ? "Gratuito" : "Assinar"}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
