'use client';

import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/cn";

export interface StepOneValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: string;
}

interface StepOneIdentityProps {
  form: UseFormReturn<StepOneValues>;
  disabledFields?: {
    email?: boolean;
    password?: boolean;
  };
}

const inputClass =
  "w-full rounded-[var(--radius)] border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export function StepOneIdentity({ form, disabledFields }: StepOneIdentityProps) {
  const {
    register,
    formState: { errors }
  } = form;

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          disabled={disabledFields?.email}
          {...register("email")}
          className={cn(
            inputClass,
            errors.email && "border-rose-400/70 focus:ring-rose-200",
            disabledFields?.email && "cursor-not-allowed opacity-70"
          )}
          placeholder="prenom@banque.com"
        />
        {errors.email ? <p className="text-xs text-rose-300">{errors.email.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="signup-password">
          Mot de passe
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          disabled={disabledFields?.password}
          {...register("password")}
          className={cn(
            inputClass,
            errors.password && "border-rose-400/70 focus:ring-rose-200",
            disabledFields?.password && "cursor-not-allowed opacity-70"
          )}
          placeholder="Au moins 8 caractères"
        />
        <p className="text-xs text-slate-400">Minimum 8 caractères, idéalement une combinaison de lettres et chiffres.</p>
        {errors.password ? <p className="text-xs text-rose-300">{errors.password.message}</p> : null}
      </div>

      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="signup-firstname">
            Prénom
          </label>
          <input
            id="signup-firstname"
            type="text"
            autoComplete="given-name"
            {...register("firstName")}
            className={cn(inputClass, errors.firstName && "border-rose-400/70 focus:ring-rose-200")}
            placeholder="Arthur"
          />
          {errors.firstName ? (
            <p className="text-xs text-rose-300">{errors.firstName.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="signup-lastname">
            Nom
          </label>
          <input
            id="signup-lastname"
            type="text"
            autoComplete="family-name"
            {...register("lastName")}
            className={cn(inputClass, errors.lastName && "border-rose-400/70 focus:ring-rose-200")}
            placeholder="Dupont"
          />
          {errors.lastName ? <p className="text-xs text-rose-300">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="signup-dob">
          Date de naissance
        </label>
        <input
          id="signup-dob"
          type="date"
          autoComplete="bday"
          {...register("dob")}
          className={cn(inputClass, errors.dob && "border-rose-400/70 focus:ring-rose-200")}
          max={new Date().toISOString().slice(0, 10)}
        />
        {errors.dob ? <p className="text-xs text-rose-300">{errors.dob.message}</p> : null}
      </div>
    </div>
  );
}
