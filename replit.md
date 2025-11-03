# Client Queue Manager

## Overview
A beautiful, productivity-focused web application for managing daily client work with priority ordering and automatic time tracking. Built with React, TypeScript, Express.js, and in-memory storage.

## Purpose
Helps users organize their client files, prioritize work through drag-and-drop, and track how long each file has been waiting for attention. Perfect for professionals who need to manage multiple client engagements efficiently.

## Current State
**Status**: Fully functional MVP with Database + Work Session History ✅

All core features are implemented and tested:
- ✅ Add, edit, and delete client files
- ✅ Drag-and-drop priority reordering
- ✅ Automatic timer tracking showing wait times
- ✅ **Realtime timer updates** - ticks every second without page refresh
- ✅ **12-hour grey out** - recently touched cards appear in grayscale (black & white)
- ✅ "Touch" functionality to reset timers and move cards to end
- ✅ Visual urgency indicators (color-coded bars) that update automatically
- ✅ Real-time dashboard statistics
- ✅ Status management (waiting, in progress, completed)
- ✅ Beautiful, responsive UI with excellent UX
- ✅ Empty states and loading states
- ✅ Toast notifications for user actions
- ✅ PostgreSQL database with persistent storage
- ✅ Work session history tracking
- ✅ View session history per client file
- ✅ Optimized concurrency handling with row-level locking

## Recent Changes (November 3, 2025)
### 12-Hour Grey Out Feature
- **Recently touched cards grey out automatically** - cards touched within 12 hours appear in grayscale (black & white)
- Visual indicator helps identify which clients were recently worked on
- Automatically un-greys after 12 hours pass (updates in realtime)
- Works seamlessly with drag-and-drop and other features
- Uses CSS grayscale filter for true grey appearance (not just transparency)

### Realtime Timer Updates with Seconds Precision
- **Timers now update every second** - watch the seconds tick up live
- **Seconds precision display** - shows exact wait time (e.g., "30m 15s", "2h 45m 30s", "45s")
- Client-side interval updates display in realtime - see every second count
- Urgency color indicators also update automatically as time passes
- Server still syncs every 30 seconds for data consistency
- Optimized performance - only triggers re-render of timer display, not full data refetch

### Horizontal Layout & Menu Consolidation (November 2, 2025)
- Redesigned queue to display cards horizontally with scrolling
- **Full-width layout** - removed max-width constraints to utilize all available horizontal space
- Cards are now fixed width (320px) arranged side-by-side
- On wide screens (1920px), 5-6 cards are visible without scrolling
- Drag-and-drop works horizontally with proper positioning
- Consolidated History, Edit, and Delete into single "Actions" dropdown menu
- Touch button remains separate as primary action
- **Touch now moves card to end** - clicking Touch resets timer AND moves card to the back of the queue
- **Optimized row-level locking** - uses `LIMIT 1 FOR UPDATE` to prevent race conditions while maintaining high throughput
- Cleaner, more compact card UI with better button organization
- Optimized droppable container width for smooth drag experience

### Database Migration & Work Sessions (October 31, 2025)
- Migrated from in-memory storage to PostgreSQL with Drizzle ORM
- Changed ID type from UUID to serial integer for better performance
- Added work_sessions table with foreign key to client_files
- Implemented automatic session tracking when touching files
- Created SessionHistory component to view work logs per client
- Added History button to each queue item
- All session endpoints tested and working

## Project Architecture

### Tech Stack
**Frontend:**
- React 18 with TypeScript
- TanStack Query v5 for data fetching and caching
- Wouter for routing
- Shadcn UI components with Tailwind CSS
- @hello-pangea/dnd for drag-and-drop
- date-fns for time formatting

**Backend:**
- Express.js server
- In-memory storage (MemStorage)
- Zod validation
- RESTful API design

### Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueueItem.tsx          # Individual queue item card
│   │   │   ├── AddEditClientModal.tsx # Add/Edit client dialog
│   │   │   ├── StatsCard.tsx          # Dashboard stat display
│   │   │   ├── EmptyState.tsx         # Empty queue state
│   │   │   └── ui/                    # Shadcn components
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Main application page
│   │   │   └── not-found.tsx
│   │   ├── lib/
│   │   │   └── queryClient.ts         # TanStack Query config
│   │   ├── App.tsx                    # Router setup
│   │   └── index.css                  # Global styles
├── server/
│   ├── routes.ts                      # API endpoint definitions
│   ├── storage.ts                     # In-memory storage implementation
│   └── index.ts                       # Express server setup
├── shared/
│   └── schema.ts                      # TypeScript types and Zod schemas
└── design_guidelines.md               # UI/UX design specifications
```

### Data Model
**ClientFile:**
- `id`: Unique identifier (UUID)
- `clientName`: Name of the client (required)
- `description`: Work description (optional)
- `status`: waiting | in_progress | completed
- `queuePosition`: Integer for drag-and-drop ordering
- `createdAt`: Timestamp when file was created
- `lastTouchedAt`: Timestamp when file was last worked on (nullable)

### API Endpoints
- `GET /api/files` - Get all client files (sorted by queuePosition)
- `POST /api/files` - Create new client file
- `GET /api/files/:id` - Get specific file
- `PATCH /api/files/:id` - Update file details
- `DELETE /api/files/:id` - Delete file
- `POST /api/files/:id/touch` - Reset timer by updating lastTouchedAt
- `POST /api/files/reorder` - Update queue positions after drag-and-drop

## Key Features Explained

### Timer Tracking
- Wait time is calculated from `lastTouchedAt` (if exists) or `createdAt`
- Displayed with seconds precision (e.g., "2h 45m 30s", "30m 15s", "45s")
- **Updates in realtime every second** - watch the seconds tick up live
- Client-side timer ticks continuously for immediate feedback
- Server sync every 30 seconds ensures data consistency
- "Touch" button resets the timer to current time and moves card to end of queue

### Urgency Indicators
Visual color-coded bars on the left of each queue item:
- 🟢 Green (Low): < 4 hours waiting
- 🟡 Yellow (Medium): 4-8 hours waiting
- 🟠 Orange (High): 8-24 hours waiting
- 🔴 Red (Critical): > 24 hours waiting

### Drag-and-Drop Reordering
- Powered by @hello-pangea/dnd
- Grab any queue item by the grip icon
- Drag to new position
- Automatically saves new order to backend
- Optimistic UI updates for smooth UX

### Dashboard Statistics
Real-time counters showing:
- Total Clients
- Waiting (status: waiting)
- In Progress (status: in_progress)
- Completed (status: completed)

## Design Philosophy
The application follows a **Linear + Material Design hybrid** approach:
- Clean, information-dense layouts
- Consistent spacing and typography
- Purposeful use of color for status and urgency
- Smooth interactions and transitions
- Excellent accessibility standards
- Mobile-responsive design

## User Workflow
1. User adds new client via "Add Client" button
2. Client appears in queue with automatic timer
3. User can drag items to reorder by priority
4. When starting work, user clicks "Touch" to reset timer
5. User updates status as work progresses
6. User can edit client details or delete when done
7. Dashboard stats update in real-time

## Testing
Comprehensive end-to-end testing completed covering:
- ✅ Add new clients with form validation
- ✅ Edit existing clients with pre-populated data
- ✅ Delete clients with confirmation
- ✅ Touch functionality to reset timers
- ✅ Status changes and stat updates
- ✅ Modal interactions
- ✅ Empty state display

## Future Enhancements
**Phase 2 Features (Not Yet Implemented):**
- Persistent database storage (PostgreSQL)
- User authentication and multi-user support
- File upload/attachment capability
- Work session history and time logs
- Advanced filtering and search
- Reporting and analytics
- Dark mode support
- Export functionality
- Keyboard shortcuts
- Notifications and reminders

## Development Guidelines
- Follow design_guidelines.md for all UI implementations
- Use TanStack Query for all data fetching
- Validate all API inputs with Zod schemas
- Maintain type safety throughout the stack
- Add data-testid attributes to interactive elements
- Keep components modular and reusable

## Running the Application
The workflow "Start application" runs `npm run dev` which:
- Starts Express backend on port 5000
- Starts Vite dev server
- Serves frontend and backend on same port
- Hot-reloads on file changes

## Known Limitations
- Data is stored in memory (resets on server restart)
- No user authentication (single-user application)
- No persistent storage
- Limited to browser tab for updates (no websockets)

## User Preferences
- User needs a simple, efficient way to manage daily client work
- Visual indicators are important for quick scanning
- Drag-and-drop is preferred for priority management
- Timer tracking helps ensure no client is neglected
