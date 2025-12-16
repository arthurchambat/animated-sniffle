# Default Interview Settings Feature

## Overview
Added a "Set to Default" feature in the new interview form that automatically generates interview names and resets all parameters to default values.

## Features Implemented

### 1. **Auto-Generated Interview Names**
- Interview names are automatically set to `"Interview X"` where X is the sequential number
- The number is based on the total count of interviews the user has created + 1
- Example: First interview → "Interview 1", Second → "Interview 2", etc.

### 2. **Reset to Default Button**
A new button in the form header that resets all fields to default values:

**Default values:**
- **Title:** `Interview X` (auto-numbered)
- **Company:** Empty (none selected)
- **Role:** Empty (none selected)  
- **Interview Type:** None selected
- **Duration:** 30 minutes
- **Focus Areas:** Empty array (none selected)
- **CV:** Cleared (existing CV not used)
- **Job Offer:** Cleared

### 3. **UI Integration**
- Button located in the top-right of "Informations générales" section
- Icon: RotateCcw (reset icon)
- Label: "Réinitialiser" (visible on desktop, icon-only on mobile)
- Provides toast feedback: "Paramètres réinitialisés aux valeurs par défaut"

## Implementation Details

### Changes Made

**File:** `components/interview/PreInterviewForm.tsx`

1. **Added imports:**
   ```typescript
   import { useState, useEffect } from "react";
   import { RotateCcw } from "lucide-react";
   ```

2. **Added state for interview count:**
   ```typescript
   const [interviewCount, setInterviewCount] = useState<number | null>(null);
   ```

3. **Added form methods:**
   ```typescript
   const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<PreInterviewFormData>({...});
   ```

4. **Fetch interview count on mount:**
   ```typescript
   useEffect(() => {
     const fetchInterviewCount = async () => {
       const { count } = await supabase
         .from('interview_sessions')
         .select('*', { count: 'exact', head: true })
         .eq('user_id', userId);
       
       setInterviewCount((count || 0) + 1);
     };
     
     fetchInterviewCount();
   }, [userId, supabase]);
   ```

5. **Auto-set default title:**
   ```typescript
   useEffect(() => {
     if (interviewCount !== null && !watch('title')) {
       setValue('title', `Interview ${interviewCount}`);
     }
   }, [interviewCount, setValue, watch]);
   ```

6. **Reset handler:**
   ```typescript
   const handleSetDefaults = () => {
     reset({
       title: `Interview ${interviewCount || 1}`,
       company: "",
       role: "",
       position_round: undefined as any,
       duration_minutes: 30,
       focus_areas: [],
       cvFile: null,
       jobOfferFile: null,
     });
     setUseExistingCV(false);
     toast.success("Paramètres réinitialisés aux valeurs par défaut");
   };
   ```

7. **Updated UI header:**
   ```typescript
   <div className="flex items-center justify-between mb-6">
     <div className="flex items-center gap-3">
       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
         <Briefcase className="h-5 w-5 text-emerald-200" />
       </div>
       <h2 className="text-xl font-semibold text-slate-100">Informations générales</h2>
     </div>
     <Button
       type="button"
       variant="outline"
       size="sm"
       onClick={handleSetDefaults}
       className="flex items-center gap-2"
     >
       <RotateCcw className="h-4 w-4" />
       <span className="hidden sm:inline">Réinitialiser</span>
     </Button>
   </div>
   ```

## User Experience

### Initial Load
1. User navigates to `/interview/new`
2. Form fetches interview count from database
3. Title field is automatically populated with `"Interview X"`
4. All other fields are empty/default

### Using Reset Button
1. User fills out some form fields
2. User clicks "Réinitialiser" button
3. All fields reset to default values
4. Title updates to `"Interview X"` with current count
5. Toast notification confirms reset
6. User can start fresh

## Benefits

1. **Faster Workflow:** Users can quickly create interviews with minimal input
2. **Consistent Naming:** Auto-numbered interviews make them easy to track
3. **Easy Recovery:** One click to reset if user makes mistakes
4. **Better UX:** Clear default state removes decision paralysis
5. **Mobile Friendly:** Icon-only button on small screens saves space

## Testing Checklist

- [x] Interview count fetches correctly on mount
- [x] Default title auto-populates with correct number
- [x] Reset button clears all fields
- [x] Reset button updates title to current count
- [x] Toast notification displays on reset
- [x] Form validation still works after reset
- [x] No TypeScript errors
- [x] Responsive design (button text hidden on mobile)

## Future Enhancements

Possible improvements:
1. Add keyboard shortcut (e.g., Ctrl/Cmd + R) for reset
2. Add confirmation dialog before reset if form has changes
3. Save draft interviews automatically
4. Add "Load Previous Settings" to reuse common configurations
5. Add templates (e.g., "Banking Interview", "Tech Interview")

---

**Status:** ✅ Complete and Tested
**Created:** December 4, 2025
**Version:** 1.0.0
