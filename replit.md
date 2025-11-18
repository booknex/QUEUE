# Client Queue Manager

### Overview
The Client Queue Manager is a productivity-focused web application designed to help professionals manage daily client work efficiently. It provides tools for organizing client files, tracking wait times with automatic priority ordering, and managing client engagements across multiple companies. The application aims to streamline workflows, ensure no client is neglected, and offer a comprehensive solution for client interaction and project management.

### User Preferences
- User needs a simple, efficient way to manage daily client work
- Visual indicators are important for quick scanning
- Drag-and-drop is preferred for priority management
- Timer tracking helps ensure no client is neglected

### System Architecture

#### UI/UX Decisions
The application utilizes a Linear + Material Design hybrid, focusing on clean, information-dense layouts, consistent typography, and purposeful color usage for status and urgency. Client cards in the queue feature prominent urgency indicators:
- **Red cards (Untouched)**: New clients that have never been touched (red border, background tint, and edge bar) - Critical urgency, requires immediate attention
- **Green cards**: Touched within 24 hours (green border, background tint, and edge bar) - Recently attended
- **Yellow cards**: Touched but not in 24-48 hours (yellow border, background tint, and edge bar) - High urgency
- **Red cards (Stale)**: Touched but not in 48+ hours (red border, background tint, and edge bar) - Critical urgency

When a new client is created, the card appears red to signal it needs immediate attention. Once touched, the card turns green and remains green for 24 hours. After 24 hours without a touch, it transitions to yellow, then red at 48 hours. This ensures that untouched clients are immediately visible and prioritized.

The application ensures mobile responsiveness across all views.

#### Technical Implementations
The application is structured around a **Client Queue** for daily tasks and a **Kanban Board** for opportunities and pipelines.

**Dynamic Status System**: The system uses a flexible, user-configurable status system where filter names define the available statuses:
- **System Filters** (non-editable, non-deletable): Five default statuses are provided - APPROVED W/ CONDITIONS, PRE-APPROVED, APP-INTAKE, NEEDS LENDER, and LOAN SETUP
- **Custom Filters**: Users can create unlimited custom status filters with any name (e.g., "HIGH PRIORITY", "WAITING DOCUMENTS")
- **Filter = Status**: Each filter's name becomes a valid status option for client files
- When a new filter is created, it automatically appears as a status option in the client file creation/edit form
- Custom filters can be edited (renamed), deleted, and reordered via drag-and-drop

Key features include:

-   **Multi-User Authentication**: Custom username/password authentication using Passport.js Local Strategy with scrypt password hashing. New users must be added to companies by owners or admins after registration. Users can belong to multiple companies with role-based access (owner/admin/member). Sessions stored in PostgreSQL with secure httpOnly cookies (sameSite: 'none' for iframe embedding support).
-   **User Management**: Owner and admin interface for viewing company-specific users, editing roles, and removing users. Three role types: Owner (full permissions), Admin (can manage users and has full access), and Member (standard access). Protection against demoting or removing the last owner. Company-specific employees accessible via Dashboard header triple-dot menu > Company Management.
-   **Self-Service Profile Management**: Users can edit their own profile (username, email, firstName, lastName), change their own password, and delete their own account via the EditUserModal. The modal includes two tabs (Profile and Password Reset) plus a delete button at the bottom. Delete functionality includes a destructive confirmation dialog that prevents users from deleting themselves if they are the last owner of any company. The modal features real-time form validation with Zod schemas, uniqueness checks for username/email, and secure scrypt password hashing. API endpoints enforce self-service only: PATCH /api/users/:id, POST /api/users/:id/password, and DELETE /api/users/:id (users can only modify their own account). User deletion automatically cascades to remove all company memberships via ON DELETE CASCADE.
-   **Multi-Company Support**: Users can manage isolated data for multiple companies with a dropdown selector. Companies can be created by any authenticated user via the dashboard interface.
-   **Real-Time Multi-User Collaboration**: WebSocket-based synchronization ensures instant updates across all connected clients for data changes (companies, files, pipelines, columns, opportunities, contacts).
-   **Priority Queue Ordering**: Client files are automatically sorted with untouched clients first (never touched since creation), followed by touched clients ordered by time since last touch (oldest first). This ensures clients who have never been attended to get immediate priority and visibility.
-   **Real-time Timer Tracking**: Wait times are calculated and displayed with second precision.
-   **Touch with Notes**: A "Touch" functionality resets timers, moves cards to the queue's end, and allows adding notes to work sessions stored in the `workSessions` table.
-   **Meeting Notes System**: Client files feature a comprehensive meeting notes system with:
    - **Current Meeting Note**: The `description` field on each client file stores the current/latest meeting note, displayed on client cards for quick reference.
    - **Historical Tracking**: The `meetingNotes` table automatically tracks a complete history of all description changes over time with timestamps.
    - **Smart Deduplication**: Meeting notes are only saved when the description field actually changes (comparison check prevents duplicate entries).
    - **Three-Tab Modal**: Client file modal includes separate tabs for "Details" (edit form), "Meeting Notes" (historical timeline), and "Touch Comments" (work session notes).
    - **Delete Capability**: Users can delete individual meeting notes and touch comments with confirmation dialogs. Delete buttons appear as trash icons next to each entry.
    - **Cache Management**: Frontend query cache properly invalidates meeting notes and touch comments on file updates and deletions to ensure fresh data.
-   **Dynamic Pipeline Management**: Full CRUD operations for pipelines, each with a dedicated kanban board.
-   **Dynamic Column Management**: Users can create, edit (rename), delete, and reorder kanban columns via drag-and-drop for both "Opportunities" and individual pipeline boards. Column headers feature a 3-dot menu with Edit and Delete options.
-   **Drag-and-Drop Opportunities**: Opportunity cards can be moved between kanban columns with visual feedback.
-   **Opportunity Management**: Create, track, and edit opportunities, linked to contacts. Opportunity cards are clickable to edit details and support deletion with confirmation.
-   **Contact Management**: Dedicated "Contacts" view with CRUD operations, CSV bulk import, duplicate prevention, and search functionality. Accessible via left sidebar menu in main view.
-   **Sidebar Navigation**: Left sidebar menu with two options (Opportunities, Contacts) allows switching between different views. The sidebar uses toggle buttons with active state highlighting to show the current view. Each view renders in the main content area to the right of the sidebar.
-   **Unified Message Inbox**: Clickable contact names (displayed in blue with hover underline) on opportunity cards and in the Contacts view open a modal with a unified instant messenger-style interface. The inbox combines calls and SMS into a single chronological timeline (no tabs), displaying incoming messages on the left and outgoing on the right as chat bubbles. Call messages show status (missed/answered) with duration and are clickable to load and play recordings inline. The design eliminates tab switching for streamlined conversation viewing. **Direct Communication**: Within the conversation history window, users can send SMS messages via an input field at the bottom (press Enter to send) and initiate calls via a "Call" button in the header (when opened from PhoneWidget). Sent messages appear immediately in the timeline, and calls are auto-dialed through the Twilio device.
-   **Pipeline Assignment**: Client files can be assigned to pipelines, indicated by a badge on the client card.
-   **Close File Functionality**: Mark files as "closed" with a timestamp.
-   **Dynamic Dashboard Filters**: Real-time counters with clickable, drag-and-droppable filter cards that dynamically reflect all system and custom statuses. Virtual filters "ALL DEALS" (first) and "Completed" (last) are always visible. System filters (NEEDS LENDER, APP-INTAKE, PRE-APPROVED, APPROVED W/ CONDITIONS, LOAN SETUP) cannot be edited or deleted but can be reordered. Custom filters show a 3-dot menu for edit/delete operations. Each stat card displays urgency indicators (green, yellow, red) based on wait times and shows "CLIENT IDLE FOR 48HRS" warnings for critical cases.
-   **Twilio Live Calling & SMS**: Integrated Twilio Voice SDK for browser-based live calling and SMS. An always-active phone widget handles outbound calls, incoming call notifications, and messaging. The widget includes a "Contacts" tab with searchable contact list, allowing users to quickly find and open any contact's message inbox.
-   **Header Navigation**: Dashboard header features a company selector dropdown and a triple-dot menu providing access to "Company Management" (for current company user management) and logout functionality.

#### System Design Choices
-   **Frontend**: React 18, TypeScript, TanStack Query v5, Wouter, Shadcn UI, Tailwind CSS, date-fns, WebSocket client.
-   **Backend**: Express.js, PostgreSQL with Drizzle ORM, Zod validation, RESTful API, WebSocket server, Passport.js Local Strategy for authentication.
-   **Authentication & Authorization**: All 50+ API routes protected with custom authentication middleware. Role-based access control (owner/admin/member) enforced at route level for company operations. User-company relationships stored in `user_companies` junction table. Auth endpoints: POST /api/register (with Zod validation), POST /api/login (with Zod validation), POST /api/logout, GET /api/user.
-   **Data Models**: Core entities include `User`, `Company`, `ClientFile`, `Pipeline`, `Contact`, `KanbanColumn`, `Opportunity`, and `StatusFilter`, all designed with appropriate foreign key relationships for data integrity and company isolation. The `StatusFilter` model includes an `isSystem` flag to distinguish between system (non-editable) and custom (user-created) filters. The `user_companies` table manages many-to-many user-company relationships with role differentiation (owner/admin/member).
-   **Project Structure**: `client/` for frontend, `server/` for backend, `shared/` for common schemas.
-   **Company Isolation**: All data is scoped to its parent company using foreign keys. Users can only access companies they're members of.

### External Dependencies
-   **PostgreSQL**: Primary database for all persistent data.
-   **Drizzle ORM**: Used for database interactions.
-   **TanStack Query v5**: For client-side data fetching and caching.
-   **@hello-pangea/dnd**: For drag-and-drop functionality in kanban boards.
-   **ws**: WebSocket library for real-time communication.
-   **Shadcn UI & Tailwind CSS**: For UI components and styling.
-   **date-fns**: For date and time manipulation.
-   **Zod**: For schema validation.
-   **Vite**: Frontend build tool.
-   **Twilio**: Voice SDK (`@twilio/voice-sdk`) for browser calls, Twilio Node.js SDK (`twilio`) for SMS and call management (requires specific environment variables and webhook configuration).