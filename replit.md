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
- **Red cards**: Not touched in 48+ hours (red border, background tint, and edge bar)
- **Yellow cards**: Not touched in 24-48 hours (yellow border, background tint, and edge bar)
- **Green border**: Recently touched (< 12 hours)
- **Default**: Normal state (12-24 hours)

The application ensures mobile responsiveness across all views.

#### Technical Implementations
The application is structured around a **Client Queue** for daily tasks and a **Kanban Board** for opportunities and pipelines. Key features include:

-   **Multi-Company Support**: Users can manage isolated data for multiple companies with a dropdown selector.
-   **Real-Time Multi-User Collaboration**: WebSocket-based synchronization ensures instant updates across all connected clients for data changes (companies, files, pipelines, columns, opportunities, contacts).
-   **Automatic Ordering**: Client files are automatically sorted by `lastTouchedAt`, with untouched files prioritized.
-   **Real-time Timer Tracking**: Wait times are calculated and displayed with second precision.
-   **Touch with Notes**: A "Touch" functionality resets timers, moves cards to the queue's end, and allows adding notes to work sessions.
-   **Dynamic Pipeline Management**: Full CRUD operations for pipelines, each with a dedicated kanban board.
-   **Dynamic Column Management**: Users can create and delete kanban columns for both "Opportunities" and individual pipeline boards.
-   **Drag-and-Drop Opportunities**: Opportunity cards can be moved between kanban columns with visual feedback.
-   **Opportunity Management**: Create, track, and edit opportunities, linked to contacts. Opportunity cards are clickable to edit details and support deletion with confirmation.
-   **Contact Management**: Dedicated "Contacts" view with CRUD operations, CSV bulk import, duplicate prevention, and search functionality.
-   **Unified Message Inbox**: Clickable contact names (displayed in blue with hover underline) on opportunity cards and in the Contacts view open a modal with a unified instant messenger-style interface. The inbox combines calls and SMS into a single chronological timeline (no tabs), displaying incoming messages on the left and outgoing on the right as chat bubbles. Call messages show status (missed/answered) with duration and are clickable to load and play recordings inline. The design eliminates tab switching for streamlined conversation viewing.
-   **Pipeline Assignment**: Client files can be assigned to pipelines, indicated by a badge on the client card.
-   **Close File Functionality**: Mark files as "closed" with a timestamp.
-   **Dashboard Statistics**: Real-time counters for Total Clients, Waiting, In Progress, and Completed.
-   **Twilio Live Calling & SMS**: Integrated Twilio Voice SDK for browser-based live calling and SMS. An always-active phone widget handles outbound calls, incoming call notifications, and messaging. The widget includes a "Contacts" tab with searchable contact list, allowing users to quickly find and open any contact's message inbox.

#### System Design Choices
-   **Frontend**: React 18, TypeScript, TanStack Query v5, Wouter, Shadcn UI, Tailwind CSS, date-fns, WebSocket client.
-   **Backend**: Express.js, PostgreSQL with Drizzle ORM, Zod validation, RESTful API, WebSocket server.
-   **Data Models**: Core entities include `Company`, `ClientFile`, `Pipeline`, `Contact`, `KanbanColumn`, and `Opportunity`, all designed with appropriate foreign key relationships for data integrity and company isolation.
-   **Project Structure**: `client/` for frontend, `server/` for backend, `shared/` for common schemas.
-   **Company Isolation**: All data is scoped to its parent company using foreign keys.

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