# Client Queue Manager

## Overview
A productivity-focused web application for managing daily client work with priority ordering and automatic time tracking. It helps users organize client files and track wait times, automatically ordering files by touch status. The project aims to provide an efficient tool for professionals managing multiple client engagements across different companies/organizations. It features a fully functional MVP with database integration, work session history, multi-company support, and close functionality.

## User Preferences
- User needs a simple, efficient way to manage daily client work
- Visual indicators are important for quick scanning
- Drag-and-drop is preferred for priority management
- Timer tracking helps ensure no client is neglected

## System Architecture

### UI/UX Decisions
The application follows a Linear + Material Design hybrid, emphasizing clean, information-dense layouts, consistent spacing and typography, purposeful color usage for status and urgency, smooth interactions, and mobile responsiveness. Key visual features include 12-hour visual indicators (green for recent, red for urgent) and real-time urgency color-coded bars (Green < 4h, Yellow 4-8h, Orange 8-24h, Red > 24h).

### Technical Implementations
The application has two main sections:
1.  **Client Queue**: Horizontal scrolling cards for daily client work, priority-ordered (untouched first, then oldest touched). Automatic ordering by `lastTouchedAt` (untouched files first, then oldest touched ascending) has replaced manual drag-and-drop. "Touch" functionality resets timers and moves the card to the end of the queue.
2.  **Kanban Board**: A separate system with header navigation for "Opportunities" and "Pipelines," independent from the client queue. It supports dynamic pipeline management, allowing users to create, edit, and delete pipelines via a modal, each with its dedicated kanban board. Both the "Opportunities" view and individual pipeline views support fully dynamic column management - users can create and delete columns as needed. Default columns for Opportunities are: New, In Progress, Closed.

**Key Features:**
-   **Multi-Company Support**: Users can manage multiple companies/organizations from a single application. A company dropdown selector in the header allows switching between different companies. Each company has its own isolated data (client files, pipelines, contacts, opportunities).
-   **Real-Time Multi-User Collaboration**: WebSocket-based real-time synchronization ensures all connected clients see changes instantly. When any user creates, updates, or deletes data (companies, files, pipelines, columns, opportunities, contacts), all other users receive updates within 1-3 seconds without page refresh. Frontend uses `useWebSocket` hook with auto-reconnect and exponential backoff. Backend broadcasts events via WebSocket server at `/ws` path. React Query cache automatically invalidates on WebSocket events using hierarchical cache keys.
-   **Automatic Ordering**: Files are automatically sorted with untouched files appearing first, followed by touched files ordered by their `lastTouchedAt` timestamp (oldest first).
-   **Real-time Timer Tracking**: Wait times are calculated from `lastTouchedAt` or `createdAt`, displayed with seconds precision, and update every second client-side. Server syncs every 30 seconds.
-   **Dynamic Pipeline Management**: Full CRUD operations for pipelines stored in PostgreSQL, managed via a UI modal. Each pipeline gets a dedicated kanban board.
-   **Dynamic Column Management**: Users can create and delete kanban columns on both the Opportunities view and individual pipeline boards. Columns are stored in the `kanban_columns` table with position ordering. Deleting a column cascades to remove all opportunities in that column. New opportunities are automatically placed in the first column.
-   **Drag-and-Drop Opportunities**: Opportunity cards can be dragged between kanban columns using @hello-pangea/dnd library. When dropped, the opportunity's columnId is updated via PATCH /api/opportunities/:id endpoint. The UI automatically refetches and updates to show cards in their new columns. Visual feedback includes cursor changes (grab/grabbing), shadow effects while dragging, and column highlighting on hover.
-   **Opportunity Management**: Create and track opportunities through kanban workflow. When creating an opportunity, users must provide contact information (name required, phone and email optional). The system creates both the contact and opportunity together. AddOpportunityModal uses react-hook-form with zodResolver for form validation. All opportunity API endpoints serialize dates to ISO strings for type safety. **Opportunity cards display the contact name as the card title** instead of the opportunity title, with fallback to opportunity title if contact name is unavailable.
-   **Contact Management**: All contacts created through opportunities are accessible via the Contacts view in the sidebar. Contacts are displayed in a list format showing name, phone, and email. Each opportunity is linked to a contact via foreign key.
-   **Close File Functionality**: Files can be marked as "closed" with a `closedAt` date, viewable in a dedicated modal accessible by clicking the "Completed" stat card.
-   **Dashboard Statistics**: Real-time counters for Total Clients, Waiting, In Progress, and Completed.

### System Design Choices
-   **Frontend**: React 18 with TypeScript, TanStack Query v5 for data fetching, Wouter for routing, Shadcn UI with Tailwind CSS, date-fns, WebSocket client with auto-reconnect.
-   **Backend**: Express.js server, PostgreSQL database with Drizzle ORM, Zod validation, RESTful API design, WebSocket server for real-time events.
-   **Data Models**:
    -   **Company**: `id`, `name`, `createdAt` - Root organization entity
    -   **ClientFile**: `id`, `clientName`, `description`, `status` (waiting | in_progress | completed), `companyId` (foreign key, cascade delete), `createdAt`, `lastTouchedAt` (nullable), `closedAt` (nullable)
    -   **Pipeline**: `id`, `name`, `companyId` (foreign key, cascade delete), `createdAt`
    -   **Contact**: `id`, `name`, `phone` (nullable), `email` (nullable), `companyId` (foreign key, cascade delete), `createdAt`
    -   **KanbanColumn**: `id`, `name`, `position`, `pipelineId` (nullable, null for Opportunities view), `createdAt`
    -   **Opportunity**: `id`, `title`, `description` (nullable), `columnId` (foreign key to kanban_columns, cascade delete), `contactId` (foreign key to contacts, cascade delete), `createdAt`
-   **Project Structure**: `client/` for frontend, `server/` for backend, `shared/` for common schemas.
-   **Company Isolation**: All client files, pipelines, and contacts are scoped to their parent company via foreign key relationships with cascade delete. API routes support optional `companyId` query parameter for filtering.

## External Dependencies
-   **PostgreSQL**: Primary database for persistent storage of client files, pipelines, and work sessions.
-   **Drizzle ORM**: Used for interacting with the PostgreSQL database.
-   **TanStack Query v5**: For client-side data fetching, caching, and synchronization with `staleTime: Infinity` configuration.
-   **@hello-pangea/dnd**: Drag-and-drop library (fork of react-beautiful-dnd) for opportunity card reordering between kanban columns.
-   **ws**: WebSocket library for real-time bidirectional communication between server and clients.
-   **Shadcn UI**: UI component library.
-   **Tailwind CSS**: For styling.
-   **date-fns**: For date and time formatting.
-   **Zod**: For schema validation on both frontend and backend.
-   **Vite**: Frontend development server and build tool.