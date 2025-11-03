---
description: "Remove a prototype from the prototypes directory"
---

Remove an existing prototype with the following steps:

**Step 1:** Show the user a list of all existing prototypes from `src/data/prototypes.ts` and ask: "Which prototype would you like to remove?" (show the prototype titles and IDs)

**Step 2:** After the user selects a prototype, perform the following cleanup:

1. **Delete** the prototype directory: `src/prototypes/{prototype-id}/`
   - This removes all files including App.tsx, types, lib, components, etc.

2. **Update** `src/data/prototypes.ts`:
   - Remove the prototype entry from the prototypes array

3. **Update** `src/app.tsx`:
   - Remove the import statement for the prototype app component
   - Remove the route for the prototype

4. **Delete** the thumbnail if it exists: `public/thumbnails/{prototype-id}.png`
   - Check if the file exists first
   - Remove it if found

After removing the prototype, inform the user that:
- The prototype has been successfully removed
- All files have been deleted
- The prototype no longer appears on the home page
