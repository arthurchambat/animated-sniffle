# Onboarding Implementation - Documentation

## 📋 Vue d'ensemble

Système d'onboarding obligatoire pour les nouveaux utilisateurs avec collecte de :
- **Secteur d'intérêt** (dropdown)
- **Rôle recherché** (dropdown)
- **Source de découverte** (dropdown)
- **CV (PDF)** - optionnel

## 🗂️ Fichiers modifiés

### 1. Types et helpers (`lib/supabase/profile.ts`)
**Ajouts :**
- `role_interest: string | null` dans `ProfileRow`
- `ROLE_INTEREST_OPTIONS` constant (Analyste, Associate, VP, Director, MD, Autre)
- `isProfileComplete(profile)` - vérifie si sector, referral, role_interest sont remplis
- `upsertOnboardingProfile()` - helper pour sauvegarder les données d'onboarding

### 2. Interface utilisateur serveur (`lib/auth/get-current-user.ts`)
**Ajouts :**
- `roleInterest`, `referral`, `cvPath` dans `CurrentUser`
- SELECT étendu pour inclure `role_interest, referral, cv_path`

### 3. Route onboarding (`app/(onboarding)/`)
**Nouveaux fichiers :**
- `layout.tsx` - Layout minimal sans sidebar
- `onboarding/page.tsx` - Wizard 2 étapes avec upload CV

**Fonctionnalités :**
- **Étape 1** : Formulaire avec 3 dropdowns (sector, role, referral)
- **Étape 2** : Upload CV optionnel (max 5 Mo)
- Progress indicator (2 barres)
- Validation avant passage à l'étape 2
- Upload vers `cvs/${userId}/cv.pdf` avec upsert
- Redirection vers `/dashboard` après finalisation

### 4. Redirection automatique (`app/(app)/layout.tsx`)
**Logique ajoutée :**
```typescript
const isProfileComplete = !!(user.sector && user.referral && user.roleInterest);
if (!isProfileComplete) {
  redirect("/onboarding");
}
```

### 5. OAuth callback (`app/auth/callback/route.ts`)
**Logique ajoutée :**
Après `exchangeCodeForSession`, vérification du profil :
- Si incomplet → redirect `/onboarding`
- Si complet → redirect vers `next` (défaut: `/dashboard`)

### 6. Mon compte (`components/account/ProfileForm.tsx`)
**Ajouts :**
- Import `ROLE_INTEREST_OPTIONS`
- Champ `roleInterest` dans le schema Zod
- Dropdown "Rôle recherché" dans le formulaire (après "referral")
- Update logic inclut `role_interest`

### 7. Migration SQL (`supabase/migrations/20241106_add_role_interest_to_profiles.sql`)
**Contenu :**
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role_interest TEXT;
```

## 🔄 Flux utilisateur

### Nouveau compte (email/password)
1. Sign up → Auth créé
2. Redirection automatique vers `/onboarding` (profil incomplet)
3. Étape 1 : Remplir sector, role, referral → "Continuer"
4. Étape 2 : Upload CV (optionnel) → "Terminer"
5. Upsert profile + CV storage
6. Redirection vers `/dashboard`
7. Accès normal à l'app

### Login Google
1. OAuth → Auth callback
2. Vérification profil dans `callback/route.ts`
3. Si incomplet → redirect `/onboarding`
4. Sinon → redirect `/dashboard`

### Utilisateurs existants
1. Login normal
2. `app/(app)/layout.tsx` vérifie profil
3. Si incomplet → redirect `/onboarding`
4. Sinon → accès normal

### Modification dans Mon compte
1. Aller sur `/account`
2. Formulaire "Informations personnelles" inclut maintenant "Rôle recherché"
3. Modification possible avec save

## 🎯 Critères de profil complet

Un profil est **complet** si :
- ✅ `sector !== null`
- ✅ `referral !== null`
- ✅ `role_interest !== null`
- ⚠️ `cv_path` est **optionnel**

## 📊 Options disponibles

### Secteurs (`SECTOR_OPTIONS`)
- finance de marché
- m&a
- private equity
- conseil
- risk
- data
- autre

### Sources (`REFERRAL_OPTIONS`)
- ami
- linkedin
- google
- université
- événement
- autre

### Rôles (`ROLE_INTEREST_OPTIONS`)
- Analyste
- Associate
- Vice President
- Director
- Managing Director
- Autre

## 🚀 Déploiement

### 1. Exécuter la migration SQL
```bash
# Via Supabase CLI
supabase db push

# Ou manuellement dans Supabase Dashboard
# SQL Editor → Coller le contenu de la migration
```

### 2. Vérifier les RLS policies
Les policies existantes sur `profiles` doivent couvrir `role_interest` :
- INSERT/UPDATE : user.id = profiles.id
- SELECT : user.id = profiles.id

### 3. Tester les flows
- [ ] Créer un nouveau compte email/password
- [ ] Vérifier redirection vers onboarding
- [ ] Compléter étape 1 + 2 (avec et sans CV)
- [ ] Vérifier arrivée sur dashboard
- [ ] Se déconnecter et reconnecter
- [ ] Vérifier pas de redirection onboarding
- [ ] Login Google avec nouveau compte
- [ ] Vérifier onboarding
- [ ] Modifier role_interest dans Mon compte

## 🐛 Debugging

### Profil toujours incomplet
```sql
-- Vérifier les données
SELECT id, email, sector, referral, role_interest, cv_path
FROM public.profiles
WHERE id = 'USER_ID';
```

### Redirect loop
- Vérifier que `/onboarding` n'est PAS dans `app/(app)/`
- Vérifier que `(onboarding)` a son propre layout

### CV upload échoue
- Vérifier bucket `cvs` existe
- Vérifier RLS policies sur storage
- Vérifier path : `${userId}/cv.pdf`

## 📝 Notes techniques

- **Pas de régression** : Aucun workflow existant modifié (sauf ajout champ dans ProfileForm)
- **Minimal diffs** : Ajouts ciblés, pas de refactoring
- **Type safety** : `role_interest` typé partout avec `as any` workarounds pour Zod enum
- **Storage** : CV remplace l'ancien avec `upsert: true`
- **UX** : Progress indicator, validation, toasts clairs

## ✅ Checklist finale

- [x] Migration SQL créée
- [x] ProfileRow étendu avec role_interest
- [x] Helpers isProfileComplete et upsertOnboardingProfile
- [x] Layout onboarding créé
- [x] Page onboarding wizard 2 étapes
- [x] Redirection dans app layout
- [x] Redirection dans auth callback
- [x] Champ ajouté dans ProfileForm
- [x] CurrentUser étendu
- [x] Tous les fichiers compilent sans erreur
- [ ] Migration SQL exécutée sur Supabase
- [ ] Tests manuels effectués
