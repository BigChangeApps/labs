---
description: "Scaffold a new prototype in the prototypes directory"
---

Create a new prototype with the following structure:

**Step 1:** Ask the user: "What's the name of your prototype?" (e.g., "AI Assisted Worksheets" - will be converted to kebab-case for the ID and path)

**Step 2:** After receiving the name, ask: "What's a brief description for this prototype?"

**Step 3:** After receiving the description, ask: "What device type is this prototype for?" (Options: desktop, mobile, tablet. Default: desktop)

**Step 4:** After receiving the device type, ask: "What's the visibility for this prototype?" (Options: public, internal. Default: internal. Explain: "public" = visible to customers, "internal" = only visible when VITE_SHOW_INTERNAL is true)

**Step 5:** After receiving the visibility, create the following files:

1. `src/prototypes/{prototype-name}/App.tsx` - Main app component with:
   - TooltipProvider wrapper
   - PrototypeBanner component
   - Simple splash page with title and description
   - Toaster component

2. `src/prototypes/{prototype-name}/types/index.ts` - Empty file with comment "// Add types here"

3. `src/prototypes/{prototype-name}/lib/store.ts` - Basic Zustand store template

4. `src/prototypes/{prototype-name}/lib/mock-data.ts` - Empty file with comment "// Add mock data here"

5. **Update** `src/data/prototypes.ts` - Add new prototype entry to the array with:
   - id: {kebab-case-version-of-name}
   - title: {name-as-provided}
   - description: {description}
   - thumbnail: "/thumbnails/{kebab-case-version-of-name}.png"
   - path: "/{kebab-case-version-of-name}"
   - createdAt: {today's date in YYYY-MM-DD format}
   - deviceType: {device-type}
   - visibility: {visibility}

6. **Update** `src/app.tsx` - Add:
   - Import: `import { {PascalCaseName}App } from "@/prototypes/{prototype-name}/App";`
   - Route wrapped in ProtectedRoute:
   ```tsx
   <Route
     path="/{prototype-name}/*"
     element={
       <ProtectedRoute prototypeId="{kebab-case-version-of-name}">
         <{PascalCaseName}App />
       </ProtectedRoute>
     }
   />
   ```

After creating the files, inform the user that:
- The prototype scaffold has been created
- They can navigate to `http://localhost:5173/{prototype-name}` to view it
- They should add a thumbnail image at `public/thumbnails/{prototype-name}.png`
- They can start building by adding components in the components folder
