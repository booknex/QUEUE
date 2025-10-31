# Design Guidelines: Client File Queue Management System

## Design Approach

**Selected Approach:** Design System - Linear + Material Design Hybrid

This productivity application prioritizes efficiency, clarity, and learnability. Drawing inspiration from Linear's clean task management interface and Material Design's data-dense patterns, the design emphasizes information hierarchy, quick scanning, and intuitive interactions.

**Core Principles:**
- Information clarity over decoration
- Consistent, predictable interactions
- Dense but scannable layouts
- Purposeful use of space for productivity

---

## Typography

**Font Family:** 
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono for timers/numeric data

**Type Scale:**
- Page Title: text-3xl, font-semibold
- Section Headers: text-xl, font-semibold  
- Queue Item Titles: text-lg, font-medium
- Body/Descriptions: text-base, font-normal
- Labels/Meta: text-sm, font-medium
- Timers/Stats: text-sm, font-mono

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Micro spacing (gaps, padding): p-2, gap-2
- Component spacing: p-4, gap-4
- Section spacing: p-6, gap-6
- Major spacing: p-8, mt-8

**Container Strategy:**
- Main application: max-w-7xl mx-auto px-6
- Queue container: Full width within max constraint
- Sidebar (if used): Fixed width w-64

**Grid System:**
- Dashboard stats: grid-cols-4 (desktop), grid-cols-2 (tablet), grid-cols-1 (mobile)
- Queue items: Single column for clarity and drag-drop

---

## Component Library

### Core UI Elements

**Queue Item Card:**
- Full-width container with subtle border
- Internal padding: p-4
- Rounded corners: rounded-lg
- Includes: drag handle (left), client name (prominent), description, timer display (right), status indicator, action buttons
- Hover state: Slight elevation effect
- Active drag state: Increased elevation, reduced opacity

**Timer Display:**
- Monospace font for numeric consistency
- Format: "2d 5h 30m" or "3h 45m" or "25m"
- Positioned top-right of each queue item
- Size: text-base md:text-lg for visibility

**Status Badges:**
- Small rounded pills: px-3 py-1 rounded-full text-xs font-medium
- States: Waiting, In Progress, Recently Touched, Completed
- Positioned near client name

**Urgency Indicators:**
- Vertical accent bar on left edge of queue item (w-1)
- Thickness indicates urgency level
- Position: absolute left-0 top-0 bottom-0

### Navigation & Controls

**Top Navigation Bar:**
- Fixed position: sticky top-0
- Height: h-16
- Contains: App title, quick stats summary, action buttons (Add Client, Filter, Settings)
- Shadow for depth separation

**Action Buttons:**
- Primary CTA: px-6 py-2.5 rounded-lg font-medium
- Secondary: px-4 py-2 rounded-md font-medium with border
- Icon buttons: p-2 rounded-md (for drag handles, delete, etc.)

### Forms

**Add/Edit Client Modal:**
- Centered overlay: max-w-md
- Form fields: Full width with mb-4 spacing
- Input styling: px-4 py-2.5 rounded-lg border w-full
- Label: text-sm font-medium mb-1.5
- Textarea for description: min-h-24

### Data Displays

**Dashboard Stats Cards:**
- Grid layout: 4 columns on desktop
- Card structure: p-6 rounded-lg border
- Stat number: text-3xl font-bold
- Stat label: text-sm font-medium mt-1

**Queue List Container:**
- Vertical stack with gap-3
- Scrollable area with max height consideration
- Empty state placeholder when no items

### Overlays & Modals

**Modal Backdrop:**
- Fixed overlay: bg-black/50
- Click-to-dismiss functionality
- Modal content: rounded-xl max-w-lg p-6

**Toast Notifications:**
- Fixed bottom-right: bottom-6 right-6
- Rounded: rounded-lg px-4 py-3
- Auto-dismiss after 3 seconds

---

## Drag-and-Drop Interactions

**Visual Feedback:**
- Drag handle icon (6 dots, 2x3 grid) on hover
- Cursor changes to grab/grabbing
- Item being dragged: opacity-50
- Drop zone indication: Border highlight on valid drop areas
- Smooth reordering animation: transition-all duration-200

---

## Icons

**Icon Library:** Heroicons (via CDN)
- Drag handle: Bars3Icon (horizontal) or custom 6-dot pattern
- Timer: ClockIcon
- Status: CheckCircleIcon, ExclamationCircleIcon
- Actions: PlusIcon, TrashIcon, PencilIcon, EyeIcon
- Navigation: ChartBarIcon, Cog6ToothIcon

---

## Animation Guidelines

**Use Sparingly:**
- Queue reordering: 200ms ease transition
- Modal entrance/exit: 150ms scale and fade
- Hover states: 100ms ease
- NO continuous animations or scrolling effects

---

## Accessibility Standards

- All interactive elements have focus states (ring-2 ring-offset-2)
- Form inputs have associated labels
- Buttons have descriptive aria-labels
- Keyboard navigation for drag-drop (arrow keys + space)
- Timer updates announced to screen readers
- Sufficient contrast ratios throughout
- Touch targets minimum 44x44px

---

## Images

**No hero image needed** - This is a dashboard/productivity application where immediate access to functionality is paramount. Interface should load directly into the queue management view without marketing imagery.

---

## Responsive Breakpoints

- Mobile: Base styles, single column layouts
- Tablet (md:): 2-column stat grids, adjusted spacing
- Desktop (lg:): 4-column grids, optimal spacing, show more queue items simultaneously