'use client';

import { useState } from "react";
import { X, Building2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BillingData } from "./PaymentsCard";

interface PaymentsManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokensMinutes: number;
  onSaveBilling?: (data: BillingData) => void;
  onSelectPackage?: (planId: string) => void;
}

type TabType = 'overview' | 'billing' | 'tokens';

const PACKAGES = [
  {
    id: '30min',
    name: '30 minutes',
    minutes: 30,
    price: 15,
    pricePerHour: 30,
    description: 'Parfait pour tester'
  },
  {
    id: '2h',
    name: '2 heures',
    minutes: 120,
    price: 50,
    pricePerHour: 25,
    discount: '17% off',
    description: 'Pour une préparation régulière'
  },
  {
    id: '5h',
    name: '5 heures',
    minutes: 300,
    price: 100,
    pricePerHour: 20,
    discount: '33% off',
    bestValue: true,
    description: 'Meilleur rapport qualité/prix'
  }
];

export function PaymentsManageModal({
  isOpen,
  onClose,
  tokensMinutes,
  onSaveBilling,
  onSelectPackage
}: PaymentsManageModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingData, setBillingData] = useState<BillingData>({
    name: '',
    company: '',
    address: '',
    vat: ''
  });

  if (!isOpen) return null;

  const hours = Math.floor(tokensMinutes / 60);
  const minutes = tokensMinutes % 60;

  const handleSaveBilling = () => {
    if (onSaveBilling) {
      onSaveBilling(billingData);
    }
    toast.success('Informations de facturation enregistrées');
    setShowBillingForm(false);
    setBillingData({ name: '', company: '', address: '', vat: '' });
  };

  const handleSelectPackage = (planId: string) => {
    if (onSelectPackage) {
      onSelectPackage(planId);
    }
    const pkg = PACKAGES.find(p => p.id === planId);
    toast.success(`Package "${pkg?.name}" sélectionné - Intégration Stripe à venir`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/15 bg-[#0a0f1f] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Gestion des paiements</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'billing'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Facturation
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'tokens'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Ajouter des tokens
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Tokens disponibles</h3>
                <p className="text-4xl font-bold text-white">
                  {hours}h {minutes}min
                </p>
                <p className="text-sm text-white/60 mt-2">
                  Utilise tes tokens pour des sessions d'interview avec l'IA
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Actions rapides</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={() => setActiveTab('tokens')}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 justify-start"
                  >
                    Ajouter des tokens
                  </Button>
                  <Button
                    onClick={() => setActiveTab('billing')}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 justify-start"
                  >
                    Gérer la facturation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {!showBillingForm ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-white/60 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Informations de facturation
                        </h3>
                        <p className="text-sm text-white/60">
                          Aucune information de facturation enregistrée
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowBillingForm(true)}
                    className="bg-white text-[#0a0f1f] hover:bg-white/90"
                  >
                    Ajouter mes informations de facturation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Ajouter les informations de facturation
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={billingData.name}
                        onChange={(e) => setBillingData({ ...billingData, name: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Entreprise (optionnel)
                      </label>
                      <input
                        type="text"
                        value={billingData.company}
                        onChange={(e) => setBillingData({ ...billingData, company: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="Mon Entreprise"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Adresse
                      </label>
                      <textarea
                        value={billingData.address}
                        onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="123 Rue Example, 75001 Paris, France"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Numéro de TVA (optionnel)
                      </label>
                      <input
                        type="text"
                        value={billingData.vat}
                        onChange={(e) => setBillingData({ ...billingData, vat: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="FR12345678901"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSaveBilling}
                      className="bg-white text-[#0a0f1f] hover:bg-white/90"
                    >
                      Enregistrer
                    </Button>
                    <Button
                      onClick={() => setShowBillingForm(false)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tokens Tab */}
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Choisir un package
                </h3>
                <p className="text-sm text-white/60">
                  Sélectionne le package qui correspond à tes besoins
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-xl border p-6 transition-all ${
                      pkg.bestValue
                        ? 'border-white/30 bg-white/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {pkg.bestValue && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#0a0f1f] font-semibold">
                        Meilleure valeur
                      </Badge>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{pkg.name}</h4>
                        <p className="text-sm text-white/60">{pkg.description}</p>
                      </div>

                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">{pkg.price}€</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-white/60">
                            {pkg.pricePerHour}€/h
                          </span>
                          {pkg.discount && (
                            <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                              {pkg.discount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                          <Check className="h-4 w-4" />
                          <span>{pkg.minutes} minutes de tokens</span>
                        </div>

                        <Button
                          onClick={() => handleSelectPackage(pkg.id)}
                          className={
                            pkg.bestValue
                              ? 'w-full bg-white text-[#0a0f1f] hover:bg-white/90'
                              : 'w-full bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          }
                        >
                          Sélectionner
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">
                  💳 L'intégration Stripe sera disponible prochainement. Pour l'instant, ces boutons 
                  sont des placeholders pour tester l'interface.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
