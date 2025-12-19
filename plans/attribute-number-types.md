# Attribute Number Types - Improvement Plan

## Current State
- Single "Number" type with optional "Units" field
- User manually enters unit text (e.g., "kg", "cm", "hours")
- No validation or formatting based on unit type

## Problem
- Generic approach doesn't guide users toward appropriate numeric types
- No built-in formatting (currency symbols, percentage signs, etc.)
- Units are free-text, leading to inconsistency ("kg" vs "kilograms" vs "KG")
- Doesn't set up well for future features like calculations, filtering, or reporting

---

## Proposed Attribute Types

### 1. Measurement
For physical quantities with standardized units.

**Unit categories:**
- Length (mm, cm, m, km, in, ft, yd, mi)
- Weight/Mass (g, kg, lb, oz, ton)
- Volume (ml, L, gal, fl oz, m³)
- Area (m², ft², acres)
- Temperature (°C, °F, K)
- Time/Duration (seconds, minutes, hours, days)
- Speed (km/h, mph, m/s)
- Pressure (PSI, bar, kPa)
- Power (W, kW, HP)

**UI:** Dropdown to select unit category, then specific unit

**Example use cases:**
- Equipment dimensions
- Tank capacity
- Operating temperature range
- Service interval (hours)

---

### 2. Currency
For monetary values.

**Options:**
- Currency selector (GBP, USD, EUR, AUD, etc.)
- Automatic formatting with symbol
- Decimal precision (typically 2)

**Example use cases:**
- Purchase price
- Replacement cost
- Service cost
- Depreciation value

---

### 3. Percentage
For values expressed as percentages.

**Options:**
- Display with % symbol
- Optional min/max bounds (0-100 or custom)
- Decimal precision

**Example use cases:**
- Battery health
- Efficiency rating
- Completion status
- Depreciation rate

---

### 4. Count / Quantity
For whole numbers representing countable items.

**Options:**
- Integer only (no decimals)
- Optional min/max bounds
- Optional unit label (e.g., "units", "pieces", "cycles")

**Example use cases:**
- Number of components
- Usage cycles
- Service count
- Fault occurrences

---

### 5. Rating / Score
For numeric ratings within a defined scale.

**Options:**
- Define scale (1-5, 1-10, 0-100)
- Optional visual representation (stars, progress bar)

**Example use cases:**
- Condition score
- Priority level
- Risk rating
- Performance score

---

### 6. Plain Number (keep as fallback)
For numeric values that don't fit other categories.

**Options:**
- Decimal precision
- Optional custom suffix

**Example use cases:**
- Serial numbers (though text might be better)
- Version numbers
- Custom numeric codes

---

## Recommended Implementation

### Phase 1: Core Types
Replace "Number" with:
1. **Measurement** - with unit category/unit selection
2. **Currency** - with currency selection
3. **Percentage**
4. **Number** - kept as simple fallback

### Phase 2: Enhanced Types (future)
5. **Count** - integer-only with optional bounds
6. **Rating** - scale-based with visual options

---

## UI Changes

### Type Selection
Current:
```
Type: [Dropdown: Text, Number, Dropdown, Date, Boolean]
```

Proposed:
```
Type: [Dropdown: Text, Measurement, Currency, Percentage, Number, Dropdown, Date, Yes/No]
```

### Conditional Fields

**Measurement selected:**
```
Category: [Length ▼]
Unit: [Centimeters (cm) ▼]
```

**Currency selected:**
```
Currency: [GBP - British Pound ▼]
```

**Percentage selected:**
(No additional fields needed - automatically formats with %)

**Number selected:**
```
Suffix (optional): [________]
```

---

## Data Model Changes

```typescript
export type AttributeType =
  | "text"
  | "measurement"
  | "currency"
  | "percentage"
  | "number"
  | "dropdown"
  | "date"
  | "boolean";

export interface MeasurementConfig {
  category: "length" | "weight" | "volume" | "area" | "temperature" | "time" | "speed" | "pressure" | "power";
  unit: string; // e.g., "cm", "kg", "L"
}

export interface CurrencyConfig {
  currency: string; // ISO 4217 code: "GBP", "USD", "EUR"
}

export interface Attribute {
  id: string;
  label: string;
  type: AttributeType;
  // ... existing fields
  measurementConfig?: MeasurementConfig;
  currencyConfig?: CurrencyConfig;
  suffix?: string; // For plain number type
}
```

---

## Benefits

1. **Better data quality** - Standardized units prevent inconsistency
2. **Improved UX** - Guided selection is easier than free-text
3. **Future-ready** - Enables unit conversion, calculations, filtering
4. **Reporting** - Can aggregate/compare values with same units
5. **Internationalization** - Currency/measurement localization support

---

## Migration Path

- Existing "Number" attributes with units text could be:
  - Auto-migrated if unit matches known patterns
  - Flagged for manual review/update
  - Left as "Number" type with suffix

---

## Questions to Consider

1. Should measurement units be configurable per-tenant (add custom units)?
2. Should we support unit conversion (display in different units)?
3. How granular should unit categories be?
4. Should currency support multi-currency (store in base, display in local)?
