# Attribute Management UI

A modern, full-featured admin interface for managing attributes across asset categories with drag-and-drop reordering, library management, and manufacturers/models tracking.

## Features

- **Category-Based Configuration**: Switch between different asset categories (Boiler, CCTV, Pump) with distinct attribute configurations
- **System vs Custom Attributes**:
  - System attributes are read-only and pre-mapped, can only be toggled on/off per category
  - Custom attributes are user-created, editable, and can be applied to multiple categories
- **Attribute Library**: Single source of truth for all attributes with search and filtering
- **Drag-and-Drop**: Reorder custom attributes within each category
- **Manufacturers & Models Management**: Comprehensive table view for managing equipment manufacturers and their models
- **Modern UI**: Built with ShadCN/UI and Tailwind CSS for a polished, professional look

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **ShadCN/UI** component library
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop functionality
- **Sonner** for toast notifications
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
pnpm build
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # ShadCN UI components
│   ├── category-sidebar.tsx
│   ├── system-defaults.tsx
│   ├── custom-attributes.tsx
│   ├── add-from-library-modal.tsx
│   ├── create-attribute-drawer.tsx
│   ├── edit-attribute-drawer.tsx
│   └── manufacturers-view.tsx
├── lib/
│   ├── store.ts         # Zustand state management
│   ├── mock-data.ts     # Mock data for development
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Key Concepts

### Attributes

Attributes define the properties of assets in your system. They can be:

- **System Attributes**: Pre-defined, read-only attributes that are automatically mapped to specific categories
- **Custom Attributes**: User-created attributes that can be applied to one or more categories

### Categories

Categories represent different types of assets (e.g., Boiler, CCTV, Pump). Each category has its own configuration of which attributes are enabled and in what order.

### Library

The Attribute Library is the single source of truth for all attributes. When you create or edit an attribute, it's stored in the library and can be applied to multiple categories.

### Manufacturers & Models

Track equipment manufacturers and their specific models, with usage tracking across categories.

## Usage

### Managing Attributes

1. **Select a Category**: Click on a category in the left sidebar
2. **Toggle Attributes**: Use switches to enable/disable attributes for the current category
3. **Reorder Custom Attributes**: Drag and drop custom attributes to change their order
4. **Add from Library**: Search existing attributes and apply them to the current category
5. **Create New Attribute**: Define a new attribute with type, description, and category assignments

### Managing Manufacturers

1. **Switch to Manufacturers Tab**: Click the "Manufacturers & Models" tab
2. **Add Manufacturer**: Click "+ Add Manufacturer" button
3. **Add Models**: Expand a manufacturer row and add models
4. **Edit/Delete**: Use action buttons to modify or remove entries (only if not in use)

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Mock Data

The application comes with pre-populated mock data for demonstration:

- **Categories**: Boiler, CCTV, Pump
- **System Attributes**: Manufacturer, Model, Flue Type, Gas Pressure
- **Custom Attributes**: Inspection Frequency, Height (mm), Pressure Rating, Safety Certificate
- **Manufacturers**: Vaillant, Worcester Bosch with various models

## Future Enhancements

- Backend API integration
- User authentication and permissions
- Attribute validation rules
- Bulk operations
- Export/Import functionality
- Audit logging

## License

MIT

## Support

For issues or questions, please open an issue on the project repository.
