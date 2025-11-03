# Client Queue Manager

## Overview
A beautiful, productivity-focused web application for managing daily client work with priority ordering and automatic time tracking. Built with React, TypeScript, Express.js, and in-memory storage.

## Purpose
Helps users organize their client files and track how long each file has been waiting for attention. Files are automatically ordered by when they were last touched, with untouched files appearing first. Perfect for professionals who need to manage multiple client engagements efficiently.

## Current State
**Status**: Fully functional MVP with Database + Work Session History + Close Functionality ✅

All core features are implemented and tested:
- ✅ Add, edit, and delete client files
- ✅ **Automatic ordering by last touched** - untouched files first, then oldest touched first
- ✅ Automatic timer tracking showing wait times
- ✅ **Realtime timer updates** - ticks every second without page refresh
- ✅ **12-hour visual indicators** - green borders for recently touched (<12h), red borders for needs attention (≥12h)
- ✅ "Touch" functionality to reset timers
- ✅ Visual urgency indicators (color-coded edge bars) that update automatically
- ✅ Real-time dashboard statistics
- ✅ Status management (waiting, in progress, completed)
- ✅ **Close files with specific date** - mark when work was completed
- ✅ Beautiful, responsive UI with excellent UX
- ✅ Empty states and loading states
- ✅ Toast notifications for user actions
- ✅ PostgreSQL database with persistent storage
- ✅ Work session history tracking
- ✅ View session history per client file

## Recent Changes (November 3, 2025)
### Kanban Board - Separate Entity
- **Independent kanban system** - separate from client queue files
- **Header with navigation** - "Kanban Board" title with "Opportunities" and "Pipelines" buttons, plus "Add New" button
- **Opportunities view** - columns: New, In Progress, Closed
- **Pipelines view** - columns: Lead, Qualified, Converted
- Each view has its own kanban board with dedicated data
- Positioned below the horizontal client queue scrollbar

### Clickable Completed Stat Card
- **Completed stat card is now clickable** - click to view all closed files
- **ClosedFilesModal component** - displays all files with closedAt dates
- **Completed count** - now accurately reflects files with closedAt set (not just status)
- **Clean UI** - shows client name, description, closed date, and status badge
- Empty state when no closed files exist

### Close File Functionality
- **Added closedAt field** to track when a file was closed
- **CloseFileModal component** with date picker (defaults to today)
- **Close action** in Actions dropdown menu
- **API endpoint** POST /api/files/:id/close for setting close dates
- **Date persistence** - reopening modal shows previously selected date
- Fixed form reset bug to properly maintain selected dates
- Fixed ordering bug - red cards (untouched) now properly appear first
### Automatic Ordering by Last Touched
- **Removed drag-and-drop functionality** - manual reordering no longer needed
- **Automatic ordering** - files sorted by lastTouchedAt automatically
- **Untouched files first** - clients that have never been touched appear at the front
- **Then oldest touched** - touched clients ordered by lastTouchedAt ascending
- **Simplified queue management** - no manual positioning required
- Removed queuePosition field from schema and database
- Removed reorder API endpoint

### Previous Changes (Earlier November 3, 2025)
### 12-Hour Visual Indicators
- **Recently touched cards (< 12 hours):** Green border highlights using `border-green-500`
- **Needs attention cards (≥ 12 hours or never touched):** Red border highlights using `border-red-500`
- Visual indicators help identify client status at a glance
- Automatically updates in realtime as thresholds are crossed (every second)
- Works seamlessly with drag-and-drop and other features
- Backend serializes dates as ISO strings for reliable client-side parsing

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
- date-fns for time formatting

**Backend:**
- Express.js server
- PostgreSQL database with Drizzle ORM
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
│   ├── storage.ts                     # Database storage implementation
│   ├── db.ts                          # Drizzle database connection
│   └── index.ts                       # Express server setup
├── shared/
│   └── schema.ts                      # TypeScript types and Zod schemas
└── design_guidelines.md               # UI/UX design specifications
```

### Data Model
**ClientFile:**
- `id`: Unique identifier (serial integer)
- `clientName`: Name of the client (required)
- `description`: Work description (optional)
- `status`: waiting | in_progress | completed
- `createdAt`: Timestamp when file was created
- `lastTouchedAt`: Timestamp when file was last worked on (nullable)
- `closedAt`: Timestamp when file was closed (nullable)

### API Endpoints
- `GET /api/files` - Get all client files (sorted by lastTouchedAt: nulls first, then oldest first)
- `POST /api/files` - Create new client file
- `GET /api/files/:id` - Get specific file
- `PATCH /api/files/:id` - Update file details
- `DELETE /api/files/:id` - Delete file
- `POST /api/files/:id/touch` - Reset timer by updating lastTouchedAt and log work session
- `POST /api/files/:id/close` - Set closed date for a file
- `GET /api/files/:id/sessions` - Get work session history for a file
- `GET /api/sessions` - Get all work sessions

## Key Features Explained

### Application Structure
The application has two main sections:
1. **Client Queue** - Horizontal scrolling cards for daily client work management (priority-ordered: untouched first, oldest touched after)
2. **Kanban Board** - Separate system with header navigation for Opportunities and Pipelines (independent from client queue)

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

### Automatic Ordering
- Files automatically ordered by lastTouchedAt
- Untouched files (lastTouchedAt = null) appear first
- Touched files ordered by lastTouchedAt ascending (oldest first)
- Most urgent clients naturally rise to the front
- No manual reordering needed

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
2. Client appears at front of queue (untouched files show first)
3. When starting work, user clicks "Touch" to reset timer
4. Touched client automatically moves to appropriate position in queue
5. User updates status as work progresses
6. User can view work session history, edit details, or delete when done
7. Dashboard stats and timers update in real-time

## Testing
Comprehensive end-to-end testing completed covering:
- ✅ Add new clients with form validation
- ✅ Edit existing clients with pre-populated data
- ✅ Delete clients with confirmation
- ✅ Touch functionality to reset timers
- ✅ Close files with specific dates
- ✅ Date persistence in close modal
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
