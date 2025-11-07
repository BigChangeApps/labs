---
description: "Scaffold a new component demo in the playground"
---

Create a new playground component demo with the following structure:

**Step 1:** Ask the user: "What's the name of your component demo?" (e.g., "Button Variants" - will be converted to kebab-case for the ID and path)

**Step 2:** After receiving the name, ask: "What's the title for this component?" (e.g., "Button Variants" - defaults to the name if not provided)

**Step 3:** After receiving the title, ask: "What's a brief description for this component demo?"

**Step 4:** After receiving the description, ask: "What category does this belong to?" (Options: forms, navigation, data-display, feedback. Default: forms)

**Step 5:** After receiving all information, create the following:

1. `src/playground/components/{component-name}/index.tsx` - Component demo template:
   ```tsx
   export function {PascalCaseName}Demo() {
     return (
       <div className="space-y-6">
         <div>
           <h1 className="text-2xl font-bold text-hw-text mb-2">{title}</h1>
           <p className="text-sm text-muted-foreground">
             {description}
           </p>
         </div>
         <div className="border rounded-lg p-6 bg-card">
           {/* Add your component demo here */}
         </div>
       </div>
     );
   }
   ```

2. **Update** `src/playground/lib/registry.ts` - Add new component entry to the components array:
   ```tsx
   {
     id: "{kebab-case-version-of-name}",
     title: "{title}",
     category: "{category}",
     path: "/playground/{kebab-case-version-of-name}",
     description: "{description}",
   },
   ```

3. **Update** `src/playground/App.tsx`:
   - Add import: `import { {PascalCaseName}Demo } from "./components/{component-name}";`
   - Add route: `<Route path="{kebab-case-version-of-name}" element={<{PascalCaseName}Demo />} />`

**Conversion Rules:**
- Component name "Button Variants" → kebab-case: "button-variants"
- Component name "Button Variants" → PascalCase: "ButtonVariantsDemo"
- Path will be: "/playground/button-variants"

After creating the files, inform the user that:
- The component demo scaffold has been created
- They can navigate to `http://localhost:5173/playground/{component-name}` to view it
- They can start building the demo in `src/playground/components/{component-name}/index.tsx`
- If they need additional files (like dialogs, forms, etc.), they can add them in the same folder


