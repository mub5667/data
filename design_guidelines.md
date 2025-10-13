# Design Guidelines: Multi-Dataset Admin Dashboard

## Design Approach: Modern Enterprise Dashboard System
**Selected Approach:** Design System (Enterprise Admin Pattern)  
**Primary Inspiration:** Ant Design + Linear's clean aesthetics + Notion's data organization  
**Key Principle:** Clarity and efficiency for data-heavy operations with minimal visual distraction

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 220 90% 56% (Professional blue for actions/CTAs)
- Background: 0 0% 100% (Clean white)
- Surface: 220 13% 97% (Subtle gray for cards)
- Border: 220 13% 91% (Dividers and outlines)
- Text Primary: 220 9% 15%
- Text Secondary: 220 9% 46%

**Dark Mode:**
- Primary: 220 90% 56% (Consistent action color)
- Background: 220 13% 9% (Deep charcoal)
- Surface: 220 13% 13% (Elevated surfaces)
- Border: 220 13% 20% (Subtle dividers)
- Text Primary: 220 9% 95%
- Text Secondary: 220 9% 65%

**Semantic Colors:**
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 84% 60%
- Info: 199 89% 48%

### B. Typography
- **Font Family:** 'Inter' from Google Fonts (primary), system-ui (fallback)
- **Headings:** Semi-bold (600) - Dashboard title (text-2xl), Section headers (text-lg)
- **Body:** Regular (400) - Table content (text-sm), Form labels (text-sm)
- **Data/Numbers:** Mono font for consistency - 'JetBrains Mono' (tabular data)

### C. Layout System
**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8** for consistency
- Component padding: p-4 or p-6
- Section spacing: gap-6 or gap-8
- Inline spacing: space-x-2 or space-x-4
- Card margins: m-6 or mt-8

**Grid Structure:**
- Sidebar: Fixed 256px (w-64) on desktop, collapsible on mobile
- Main content: flex-1 with max-w-7xl container
- Data tables: Full width within container with horizontal scroll if needed

### D. Component Library

**Navigation:**
- Sidebar with collapsible sections for each dataset
- Active state: Highlighted background (surface color) + primary text
- Icons from Heroicons (outline style)

**Data Tables:**
- Striped rows for readability (alternate surface background)
- Sticky header with sort indicators
- Row hover state: Subtle background change
- Action column: Right-aligned with icon buttons (edit, delete)
- Pagination: Bottom center with page numbers and next/prev

**Forms:**
- Input fields: Border style with focus ring (primary color)
- Labels: Above inputs, text-sm, font-medium
- Required indicators: Red asterisk
- Form groups: Space-y-4 for vertical rhythm

**Buttons:**
- Primary: Filled with primary color, white text
- Secondary: Outline with border-2
- Danger: Filled with error color for delete actions
- Icon buttons: Ghost style with hover background

**Cards:**
- White/surface background with subtle shadow
- Rounded corners: rounded-lg
- Header section with title and action buttons
- Content padding: p-6

**Modals/Dialogs:**
- Overlay: backdrop-blur-sm with dark overlay
- Dialog: Centered, max-w-2xl, surface background
- Header with close button, scrollable content, sticky footer for actions

**Data Visualization:**
- Stat cards: Grid of 2-4 cards showing key metrics per dataset
- Progress indicators for data loading states
- Empty states with helpful messaging and CTA

### E. Animations
**Minimal & Purposeful:**
- Page transitions: None (instant for data apps)
- Modal entry: Fade + slight scale (150ms)
- Dropdown menus: Slide down (100ms)
- Loading states: Subtle pulse or skeleton screens
- NO decorative animations

---

## Dashboard-Specific Patterns

**Layout Structure:**
1. **Top Bar:** Logo + breadcrumb navigation + user profile
2. **Sidebar:** Dataset navigation (7 items) + settings/logout at bottom
3. **Main Area:** 
   - Page header with title + primary action (Add New)
   - Filter/search bar
   - Data table
   - Pagination

**Multi-Dataset Navigation:**
- Each dataset (ABEER, DATA, COMMISSION, etc.) as a separate route
- Visual indicator for active dataset
- Quick stats dashboard as landing page showing overview of all datasets

**CRUD Operations Flow:**
- **Create:** Modal form with all fields, validation feedback
- **Read:** Clean table view with expandable rows for details
- **Update:** Inline editing or modal form (based on complexity)
- **Delete:** Confirmation dialog with warning message

**Data Import/Export:**
- Upload area: Dashed border dropzone with file icon
- Export button: Download icon, generates Excel file
- Progress indicator during processing

---

## Images
No hero images or marketing imagery required. This is a pure data management interface. Use icons from Heroicons for:
- Dataset type indicators in sidebar
- Action buttons (edit, delete, download)
- Empty state illustrations (simple line icons)
- File upload visualization