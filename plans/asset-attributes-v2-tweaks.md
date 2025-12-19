# Asset Attributes v2 Tweaks Plan

## Overview
A collection of UX refinements and improvements to the asset-attributes v2 prototype based on user feedback.

## Changes

### 1. Sentence Case Standardization
**Goal:** Apply sentence case consistently across all UI text (labels, buttons, titles, section headings).

**Files to update:**
- `src/prototypes/asset-attributes/v2/components/pages/global-attributes.tsx` - Section labels
- `src/prototypes/asset-attributes/v2/components/pages/create-asset.tsx` - Section headings, buttons
- `src/prototypes/asset-attributes/v2/components/pages/edit-asset.tsx` - Section headings, buttons
- `src/prototypes/asset-attributes/v2/components/features/attributes/AttributeAddDrawer.tsx` - Dialog titles
- `src/prototypes/asset-attributes/v2/components/features/attributes/AttributeEditDrawer.tsx` - Dialog titles
- Other pages as needed (categories, asset-list, etc.)

**Current → New examples:**
- "Asset Information" → "Asset information"
- "Status & Condition" → "Status and condition" (then remove this section)
- "Contact & Location" → "Contact and location"
- "Dates & Lifecycle" → "Dates and lifecycle"
- "Add Attribute" → "Add attribute"
- "Save Changes" → "Save changes"
- "Cancel" → stays "Cancel" (already sentence case)

---

### 2. Global Attributes Section Alignment
**Goal:** Align global attributes sections with the create/edit asset page sections, and add section selection when creating new attributes.

**Current global attributes sections:**
- `asset-info` - "Asset Information"
- `status` - "Status & Condition" (to be removed from display)
- `contact` - "Contact & Location"
- `dates` - "Dates & Lifecycle"
- `warranty` - "Warranty"
- `your-attributes` - "Your attributes"

**Create/Edit page sections:**
- Asset Info
- Location
- Manufacturer
- Attributes (collapsible)
- Installation (collapsible)
- Warranty (collapsible)

**Proposed mapping:**

| Create/Edit Section | Global Section Key | Display Name |
|---------------------|-------------------|--------------|
| Asset info | `asset-info` | Asset info |
| Location | `contact` | Location |
| Manufacturer | `manufacturer` | Manufacturer |
| Attributes | `attributes` | Attributes |
| Installation | `installation` | Installation |
| Warranty | `warranty` | Warranty |
| (Custom user-created) | `your-attributes` | Your attributes |

**Implementation:**
1. Update `GlobalAttributeSection` type in `types/index.ts`:
   - Remove: `status`, `custom`
   - Add: `manufacturer`, `attributes`, `installation`

2. Update section labels in `global-attributes.tsx`:
   ```typescript
   const sectionLabels: Record<GlobalAttributeSection, string> = {
     "asset-info": "Asset info",
     "contact": "Location",
     "manufacturer": "Manufacturer",
     "attributes": "Attributes",
     "installation": "Installation",
     "warranty": "Warranty",
     "your-attributes": "Your attributes",
   };
   ```

3. Update section order in `global-attributes.tsx`:
   ```typescript
   const sections: GlobalAttributeSection[] = [
     "asset-info",
     "contact",
     "manufacturer",
     "attributes",
     "installation",
     "warranty",
     "your-attributes",
   ];
   ```

4. Update `mock-data.ts` - Re-assign existing attributes to new sections:
   - `global-manufacturer`, `global-model`, `global-manufacturer-serial`, `global-date-manufacture` → `manufacturer`
   - `global-date-installation` → `installation`
   - `global-date-last-service` → `attributes` (or `installation`)
   - `global-status`, `global-condition` → move to `attributes` or keep hidden

5. Add section picker to `AttributeForm.tsx` when `context === "global"`:
   - Add a select field for section placement
   - Default to "Your attributes" section

---

### 3. Remove Status Section from Global Attributes Display
**Goal:** Hide the "Status" section from the global attributes page since it's a platform-specific field.

**Implementation:**
1. Remove `status` from the sections array in `global-attributes.tsx`
2. Keep the data in mock-data.ts (Status attribute still exists, just not shown in global attributes management)
3. Status will still appear on create/edit pages as it's a core system attribute

---

### 4. Remove Reference Toggle
**Goal:** Make the "Reference" attribute not toggleable (always enabled).

**Implementation options:**

**Option A: Make Reference a required system attribute**
- In `mock-data.ts`, set `isRequired: true` for `global-customer-reference`
- This will hide the toggle since system attributes don't show toggles

**Option B: Add special handling in AttributeCard**
- Add a list of "always-enabled" attribute IDs
- Hide toggle for those specific attributes

**Recommendation:** Option A is cleaner - making Reference a required attribute.

---

### 5. Delete Confirmation Friction
**Goal:** When deleting a custom attribute, require the user to type the attribute name to confirm.

**Files to update:**
- `src/prototypes/asset-attributes/v2/components/features/attributes/AttributeEditDrawer.tsx`

**Implementation:**
1. Add state for confirmation input: `const [deleteConfirmText, setDeleteConfirmText] = useState("")`
2. Update delete dialog content:
   ```tsx
   <DialogDescription>
     Are you sure you want to delete this attribute? This will remove
     the attribute and any associated data. This action cannot be undone.
   </DialogDescription>
   <div className="py-4">
     <Label htmlFor="delete-confirm">
       Type <strong>{attribute.label}</strong> to confirm deletion
     </Label>
     <Input
       id="delete-confirm"
       value={deleteConfirmText}
       onChange={(e) => setDeleteConfirmText(e.target.value)}
       placeholder={attribute.label}
       className="mt-2"
     />
   </div>
   ```
3. Disable delete button until text matches:
   ```tsx
   <Button
     variant="destructive"
     onClick={handleDelete}
     disabled={deleteConfirmText !== attribute.label}
   >
     Delete
   </Button>
   ```
4. Reset confirmation text when dialog closes

**Pattern reference:** This matches patterns used by GitHub, Vercel, Stripe, etc. for destructive actions.

---

## Implementation Order

1. **Sentence case** - Quick find-and-replace across components
2. **Remove status section** - Simple removal from sections array
3. **Remove reference toggle** - Change isRequired to true
4. **Section alignment** - Type updates, mock data migration, section order
5. **Delete friction** - Add confirmation input to delete dialog

---

## Files Summary

| File | Changes |
|------|---------|
| `types/index.ts` | Update GlobalAttributeSection type |
| `global-attributes.tsx` | Update sections, labels, remove status |
| `create-asset.tsx` | Sentence case for headings |
| `edit-asset.tsx` | Sentence case for headings |
| `AttributeAddDrawer.tsx` | Add section picker, sentence case |
| `AttributeEditDrawer.tsx` | Add delete confirmation input, sentence case |
| `AttributeForm.tsx` | Add section select field for global context |
| `mock-data.ts` | Update attribute sections, make Reference required |

---

## Testing Checklist

- [ ] All headings and labels use sentence case
- [ ] Global attributes page shows correct sections in order
- [ ] Status section is not displayed
- [ ] Reference attribute cannot be toggled off
- [ ] Adding a global attribute prompts for section placement
- [ ] Deleting a custom attribute requires typing the name
- [ ] Create/edit asset pages still function correctly
- [ ] No TypeScript errors
- [ ] Build passes
