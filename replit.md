# Client Queue Manager

### Overview
The Client Queue Manager is a web application designed to enhance productivity for professionals by streamlining daily client work. It facilitates efficient organization of client files, automates priority ordering based on wait times, and centralizes client engagement across multiple companies. The application aims to optimize workflows, prevent client neglect, and provide a comprehensive platform for client interaction and project management, ultimately boosting efficiency and client satisfaction.

### User Preferences
- User needs a simple, efficient way to manage daily client work
- Visual indicators are important for quick scanning
- Drag-and-drop is preferred for priority management
- Timer tracking helps ensure no client is neglected

### System Architecture

#### UI/UX Decisions
The application employs a Linear + Material Design hybrid, emphasizing clean layouts, consistent typography, and purposeful color coding for status and urgency. Client cards in the queue use prominent urgency indicators: red for untouched, green for recently touched (within 24 hours), yellow for untouched within 24-48 hours, and red for untouched beyond 48 hours. This visual system ensures critical tasks are immediately identifiable. The application is fully mobile-responsive.

#### Technical Implementations
The system is built around a Client Queue for daily tasks and a Kanban Board for opportunities. A dynamic, user-configurable status system allows for both predefined system filters and unlimited custom filters, where each filter's name acts as a valid status option.

Key features include:
-   **Multi-User Authentication & Authorization**: Custom username/password authentication with Passport.js and scrypt hashing. Role-based access (Owner, Admin, Member) and multi-company support with isolated data. All 63 API routes are protected with comprehensive authorization, enforcing multi-tenant isolation.
-   **Real-Time Multi-User Collaboration**: WebSocket-based synchronization for instant updates across all connected clients.
-   **Priority Queue Ordering**: Automated sorting of client files, prioritizing untouched clients and ordering others by time since last interaction.
-   **Real-time Timer Tracking & "Touch" Functionality**: Displays precise wait times. The "Touch" feature resets timers, reorders cards, and logs work session notes.
-   **Meeting Notes System**: Stores current meeting notes on client cards and maintains a historical log of all changes with smart deduplication. A collapsible panel modal allows access to Meeting Notes and Touch Comments.
-   **Dynamic Pipeline & Kanban Management**: Full CRUD for pipelines and Kanban columns, supporting drag-and-drop for reordering and moving opportunity cards.
-   **Opportunity Management**: Create, track, edit, and assign opportunities to users within the same company.
-   **Contact Management**: Dedicated view with CRUD operations, CSV import, duplicate prevention, and search.
-   **Unified Message Inbox**: An integrated inbox for contacts displays a chronological timeline of calls and SMS, with the ability to send SMS and initiate calls directly.
-   **Dynamic Dashboard Filters**: Clickable, drag-and-droppable filter cards with real-time counters and urgency indicators, reflecting system and custom statuses.
-   **Twilio Live Calling & SMS**: Integrated Twilio Voice SDK for browser-based calls and SMS, managed through an always-active phone widget.

#### System Design Choices
-   **Frontend**: React 18, TypeScript, TanStack Query v5, Wouter, Shadcn UI, Tailwind CSS, date-fns, WebSocket client.
-   **Backend**: Express.js, PostgreSQL with Drizzle ORM, Zod validation, RESTful API, WebSocket server, Passport.js.
-   **Authentication & Authorization**: Robust system with role-based access control and multi-tenant isolation enforced through `checkCompanyAccess()` and `checkAdminAccess()` helpers.
-   **Data Models**: Core entities include `User`, `Company`, `ClientFile`, `Pipeline`, `Contact`, `KanbanColumn`, `Opportunity`, and `StatusFilter`, with foreign key relationships ensuring data integrity and company isolation.
-   **Project Structure**: `client/` for frontend, `server/` for backend, `shared/` for common schemas.
-   **Company Isolation**: All data is scoped to its parent company, accessible only by authorized members.

### External Dependencies
-   **PostgreSQL**: Primary database.
-   **Drizzle ORM**: Database interaction.
-   **TanStack Query v5**: Client-side data fetching and caching.
-   **@hello-pangea/dnd**: Drag-and-drop functionality.
-   **ws**: WebSocket library.
-   **Shadcn UI & Tailwind CSS**: UI components and styling.
-   **date-fns**: Date and time utilities.
-   **Zod**: Schema validation.
-   **Vite**: Frontend build tool.
-   **Twilio**: Voice SDK (`@twilio/voice-sdk`) for calls and Node.js SDK (`twilio`) for SMS and call management.

### Security Implementation

**Current Status (December 2024):**
All 63 API endpoints are protected with comprehensive authorization:
- ✅ New users see NO companies by default until explicitly assigned by admin/owner
- ✅ All company-scoped operations require `checkCompanyAccess()` verification
- ✅ All admin operations require `checkAdminAccess()` verification
- ✅ Self-service restrictions enforce users can only modify their own profile/password/account
- ✅ Multi-tenant isolation prevents cross-company data access
- ✅ 403 errors returned for unauthorized access attempts
- ✅ WebSocket broadcasts for real-time user operations

**Future Enhancement Recommendation:**
The architect has recommended implementing stricter user visibility controls for enhanced tenant isolation:

**Current Design:**
- GET /api/users allows admins to view all users in the system for company assignment
- This enables flexible user management but exposes user metadata across tenants

**Recommended Design (for future consideration):**
1. Replace GET /api/users with company-scoped listing (GET /api/company-users?companyId=...)
2. Add email-based invite flow (POST /api/company-users/invite) for adding external/unassigned users
3. Update UserManager UI to use scoped list for browsing + invite flow for adding new users
4. Redact company memberships outside requester's administered companies

**Benefits of Future Enhancement:**
- Stricter tenant isolation (admins cannot browse users from other companies)
- Email-based invitations provide clear user addition workflow
- Reduced information leakage across tenants
- Maintains multi-company user membership capability

**Trade-offs:**
- Requires UX redesign for user management interface
- Changes from "browse all users" to "invite by email" workflow
- May reduce discoverability for adding existing users to new companies

This enhancement is recommended but not required for the current security requirements, which are fully met by the existing implementation.

### Known Development Environment Limitations

**Text Input Lag in Replit Dev Mode (December 2024):**
- Text inputs in modals may experience lag/delay in the Replit development environment
- This does NOT affect the published/production version
- Caused by Vite HMR, React development mode, and Replit dev plugins
- **Workaround**: Use the published version for real work; dev environment for code changes only
- This is an infrastructure limitation, not an application bug