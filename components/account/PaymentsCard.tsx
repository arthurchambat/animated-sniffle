'use client';

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { PaymentsManageModal } from "./PaymentsManageModal";

interface PaymentsCardProps {
  tokensMinutes?: number;
  onSaveBilling?: (data: BillingData) => void;
  onSelectPackage?: (planId: string) => void;
}

export interface BillingData {
  name: string;
  company: string;
  address: string;
  vat: string;
}

export function PaymentsCard({ 
  tokensMinutes = 0,
  onSaveBilling,
  onSelectPackage
}: PaymentsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <BentoCard padding="lg" className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Paiements</h2>
            <p className="text-sm text-white/60">
              Gère tes tokens et informations de facturation
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="space-y-1">
            <p className="text-sm text-white/60">Tokens disponibles</p>
            <p className="text-2xl font-semibold text-white">
              {Math.floor(tokensMinutes / 60)}h {tokensMinutes % 60}min
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            Gérer
          </Button>
        </div>
      </BentoCard>

      <PaymentsManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tokensMinutes={tokensMinutes}
        onSaveBilling={onSaveBilling}
        onSelectPackage={onSelectPackage}
      />
    </>
  );
}
