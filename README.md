# 📋 Client Queue Manager

A beautiful, productivity-focused web application for managing your daily client work with intelligent priority ordering and automatic time tracking.

![Client Queue Manager](https://img.shields.io/badge/Status-Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)
![React](https://img.shields.io/badge/React-18-61dafb)

## ✨ Features

### 🎯 Priority Queue Management
- **Drag-and-Drop Reordering** - Effortlessly reorganize your queue by dragging items to new positions
- **Visual Urgency Indicators** - Color-coded bars showing how long each file has been waiting
- **Smart Status Tracking** - Monitor progress with Waiting, In Progress, and Completed states

### ⏱️ Automatic Time Tracking
- **Wait Time Display** - See exactly how long each client file has been in your queue
- **Touch to Reset** - Mark files as "touched" when you start working to reset the timer
- **Real-Time Updates** - Timers refresh automatically every 30 seconds

### 📊 Dashboard Analytics
- **Live Statistics** - Track total clients, waiting files, work in progress, and completed items
- **At-a-Glance Overview** - Beautiful stat cards show your workload distribution
- **Clean Interface** - Information-dense but scannable design inspired by Linear and Material Design

### 🎨 Beautiful UI/UX
- **Professional Design** - Clean, modern interface with thoughtful spacing and typography
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Smooth Interactions** - Delightful animations and transitions throughout
- **Empty States** - Helpful guidance when getting started

## 🚀 Getting Started

The application is ready to use! Simply:

1. Click **"Add Client"** to add your first client file
2. Fill in the client name and optional description
3. Set the status (Waiting, In Progress, or Completed)
4. Click **"Touch"** on any file when you start working on it to reset the timer
5. Drag items to reorder them by priority
6. Edit or delete files as needed

## 🎨 Urgency System

Files are automatically color-coded based on wait time:

- 🟢 **Green (Low)** - Less than 4 hours waiting
- 🟡 **Yellow (Medium)** - 4-8 hours waiting  
- 🟠 **Orange (High)** - 8-24 hours waiting
- 🔴 **Red (Critical)** - More than 24 hours waiting

This visual system helps you quickly identify which clients need attention most.

## 💡 Use Cases

Perfect for:
- **Freelancers** managing multiple client projects
- **Customer Support** teams tracking open tickets
- **Project Managers** prioritizing work items
- **Legal Professionals** managing client files
- **Consultants** organizing client engagements
- **Anyone** who needs to track and prioritize work

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS
- @hello-pangea/dnd for drag-and-drop

**Backend:**
- Express.js
- In-memory storage
- Zod validation

## 📱 Key Interactions

### Add a Client
1. Click "Add Client" button
2. Enter client name (required)
3. Add description (optional)
4. Select status
5. Submit

### Reorder Queue
1. Grab any item by the grip icon (⋮⋮)
2. Drag to desired position
3. Release to save new order

### Touch a File
1. Click "Touch" button on any queue item
2. Timer resets to current time
3. "Last touched" timestamp appears

### Edit a Client
1. Click "Edit" button
2. Modify details in the modal
3. Save changes

## 🎯 Workflow Example

A typical day might look like:

1. **Morning**: Add new clients who contacted you overnight
2. **Prioritize**: Drag urgent items to the top of your queue
3. **Work**: Click "Touch" when you start on each file
4. **Track**: Visual indicators show which clients need attention
5. **Update**: Change status as you make progress
6. **Complete**: Mark items as Completed when done

## 📝 Notes

- **Data Storage**: Currently uses in-memory storage (data resets on server restart)
- **Single User**: Designed for individual use
- **Auto-Refresh**: Queue updates every 30 seconds to keep timers accurate

## 🚢 Ready to Deploy

This application is fully functional and ready to be published! All core features have been implemented and tested:

✅ Create, read, update, and delete clients  
✅ Drag-and-drop priority reordering  
✅ Timer tracking with touch functionality  
✅ Visual urgency indicators  
✅ Real-time dashboard statistics  
✅ Beautiful, responsive design  
✅ Comprehensive testing passed  

---

**Built with ❤️ for productivity**
