# Muster 16 Form Implementation

## Overview

This is an interactive medical prescription form (Muster 16) implementation using Next.js 16, React 19, and TypeScript. The form renders a German prescription form with positioned interactive fields mapped from JSON data.

## Features

- **SVG Background Rendering**: Displays the Muster_16.svg as the form background
- **Interactive Fields**: All form fields are interactive and editable
  - Checkboxes (Gebühr frei, Geb.-pfl., noctu, etc.)
  - Toggle buttons (BVG, Hilfsmittel, Impfstoff, Bedarf)
  - Text inputs (patient info, insurance details, medications)
- **Data Mapping**: JSON data automatically populates form fields
- **QZ Tray Integration**: Print support via QZ Tray for direct printer access
- **Browser Print Fallback**: Falls back to standard browser print if QZ Tray unavailable

## Architecture

```
examples/form/
├── src/
│   ├── components/
│   │   ├── FormCheckbox.tsx     # Checkbox component with positioning
│   │   ├── FormInput.tsx        # Text input/textarea component
│   │   ├── FormToggle.tsx       # Toggle number button component
│   │   └── FormRenderer.tsx     # Main form renderer with SVG overlay
│   ├── types/
│   │   └── form.ts              # TypeScript type definitions
│   └── utils/
│       └── qzTrayPrint.ts       # QZ Tray printing integration
├── app/
│   ├── page.tsx                 # Home page with form display
│   └── layout.tsx               # Root layout
└── public/
    ├── Muster_16.svg            # Form background image
    ├── Muster_16.json           # Form field definitions with coordinates
    ├── Muster_16.pdf            # Original PDF for printing
    └── example-data.json        # Sample form data

```

## How It Works

### 1. Form Definition (Muster_16.json)

Contains metadata for all form fields:
- Field name and type (CHECK_BOX, LABEL, TOGGLE_NUMBER, DATE_PICKER)
- Position coordinates (x1, y1, x2, y2 in points)
- Read-only status
- Display values for toggles

### 2. Form Data (example-data.json)

Contains the actual data to populate the form:
- Boolean values for checkboxes and toggles
- String values for text fields
- Patient information, insurance details, medications, etc.

### 3. Form Renderer

The `FormRenderer` component:
1. Loads the SVG background
2. Overlays positioned interactive components based on field definitions
3. Maps data from JSON to form fields
4. Handles user interactions and updates

### 4. Field Components

Each field type has its own component:
- **FormCheckbox**: Standard HTML checkbox with absolute positioning
- **FormInput**: Text input or textarea with transparent background
- **FormToggle**: Clickable number toggle with visual feedback

### 5. Printing

Two printing methods:
- **QZ Tray**: Direct printer access for production environments
- **Browser Print**: Standard window.print() as fallback

## Setup & Installation

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- QZ Tray (optional, for advanced printing)

### Install Dependencies

```bash
cd examples/form
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### QZ Tray Setup (Optional)

1. Download and install QZ Tray from https://qz.io/download/
2. Run QZ Tray application
3. The app will automatically detect and connect to QZ Tray
4. Select printer from dropdown and use "Print Form" button

## Usage

### Viewing the Form

1. Start the dev server
2. Navigate to http://localhost:3000
3. The form loads with example data automatically

### Editing Fields

- Click checkboxes to toggle
- Click toggle numbers (6, 7, 8, 9) to enable/disable
- Type in text fields to edit patient/insurance/medication info
- Changes are reflected in real-time

### Printing

**With QZ Tray:**
1. Ensure QZ Tray is running
2. Select printer from dropdown
3. Click "Print Form" button
4. Form prints directly to selected printer

**Without QZ Tray:**
1. Click "Print Form" button
2. Browser print dialog opens
3. Select printer and print

## Customization

### Adding New Fields

1. Update `Muster_16.json` with new field definition:
```json
{
  "name": "new_field_name",
  "type": "LABEL",
  "isReadOnly": false,
  "rect": {
    "x1": 100,
    "y1": 100,
    "x2": 200,
    "y2": 120
  }
}
```

2. Add data to `example-data.json`:
```json
{
  "new_field_name": "Field value"
}
```

3. Update TypeScript types in `src/types/form.ts`

### Modifying Form Layout

1. Edit the SVG file: `public/Muster_16.svg`
2. Update field coordinates in `Muster_16.json` to match new layout
3. Adjust scale factor in `FormRenderer.tsx` if needed

### Styling

Components use inline styles for precise positioning. Modify:
- `FormRenderer.tsx`: Overall layout and scale
- Individual field components: Field-specific styling
- `app/page.tsx`: Page layout and controls

## Technical Notes

### Coordinate System

- All coordinates are in points (pt)
- Origin (0,0) is top-left corner
- SVG and field coordinates must align precisely
- Scale factor applied for better visibility (default 1.5x)

### Performance

- SVG loads as static image (fast)
- React components only render for interactive fields
- State updates are localized per field

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 19 features require recent browser versions
- QZ Tray requires WebSocket support

## Data Flow

```
example-data.json → Home page (fetch) → FormRenderer (props) → Field Components (render)
                                                     ↓
                                              User Interaction
                                                     ↓
                                              State Update (useState)
                                                     ↓
                                              Re-render Fields
```

## Troubleshooting

### Form not loading
- Check browser console for errors
- Verify JSON files are in public/ directory
- Ensure SVG file path is correct

### Fields misaligned
- Verify coordinates in Muster_16.json
- Check scale factor in FormRenderer
- Ensure SVG viewBox matches form dimensions

### QZ Tray not connecting
- Confirm QZ Tray application is running
- Check browser console for connection errors
- Try browser print as fallback

### Print quality issues
- Use PDF printing method for best quality
- Adjust printer settings (margins, scale)
- Consider using native PDF viewer for printing

## Future Enhancements

- [ ] Lexical rich text editor integration for complex text fields
- [ ] Form validation
- [ ] Multiple form pages support
- [ ] Save/load form state
- [ ] Export to PDF with filled data
- [ ] Digital signature support
- [ ] Batch processing for multiple prescriptions

## License

This implementation is for demonstration purposes.
