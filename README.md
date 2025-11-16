<div id="top"></div>

<br />
<div align="center">
  <h3 align="center">Empowered Canvass</h3>
  <p align="center">A modern, mobile-friendly web application for organizing and managing canvassing campaigns with collaborative project-based workflows.</p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#key-features">Key Features</a>
    </li>
    <li>
      <a href="#architecture">Architecture</a>
      <ul>
        <li><a href="#database-schema">Database Schema</a></li>
        <li><a href="#page-structure--routes">Page Structure & Routes</a></li>
      </ul>
    </li>
    <li>
      <a href="#project-setup">Project Setup & Installation</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#development">Development</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#ai-disclosure">AI Disclosure</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

**Empowered Canvass** is a production-ready web application designed to streamline canvassing operations for political campaigns, community organizing, and grassroots movements. Built with modern web technologies, it provides a collaborative platform where teams can organize multiple canvassing projects, collect voter/constituent information, and track engagement across campaigns.

### The Challenge

Traditional canvassing operations face several pain points:
- **Disorganized Note-Taking**: Paper forms, scattered spreadsheets, lost data
- **No Collaboration**: Individual canvassers working in silos without team visibility
- **Multiple Campaigns**: Difficulty managing notes across different projects (e.g., voter registration, Section 8 housing, community outreach)
- **Mobile Inefficiency**: Desktop-only tools unusable in the field
- **Limited Search**: No way to quickly find past interactions or contacts
- **No Data Export**: Locked-in data with no CSV export for analysis

### The Solution

Empowered Canvass addresses these challenges through:

- **Project-Based Organization**: Create separate projects for different campaigns (e.g., "Section 8 Housing Canvass", "Voter Registration Drive"), each with its own team and notes
- **Multi-User Collaboration**: Invite team members to projects, see all team notes in one place, track who talked to whom
- **Mobile-First Design**: Fully responsive interface optimized for smartphones and tablets - take notes on the go
- **Smart Search & Filters**: Instantly find contacts by name, search note content, filter by date range
- **Email Validation**: Collect and validate contact emails to enable follow-up campaigns
- **CSV Export**: Download all project data for analysis, mail merges, or integration with other tools
- **Real-Time Updates**: See team activity as it happens with modern React architecture

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

This project utilizes the following modern frameworks and libraries:

**Full-Stack Framework:**

[![React Router](https://img.shields.io/badge/React_Router_v7_(Remix)-3178C6?style=for-the-badge&logo=remix&logoColor=white)](https://remix.run/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

**Styling & UI:**

[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Database & ORM:**

[![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Security:**

[![Bcrypt](https://img.shields.io/badge/Bcrypt-338433?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/bcryptjs)

<p align="right">(<a href="#top">back to top</a>)</p>

## Key Features

### Core Functionality
- **User Authentication**: Secure registration and login with session-based authentication
- **Project Management**: Create and organize multiple canvassing projects
- **Note Collection**: Capture contact name, email (validated), and detailed notes with timestamps
- **View All Notes**: See all canvassing interactions for a project in one organized view
- **Edit & Delete**: Update or remove notes as needed

### Collaboration Features
- **Multi-User Projects**: Invite team members to collaborate on projects
- **Team Visibility**: See all team members' notes within a project
- **User Management**: View project members and their contributions
- **Shared Data**: Centralized note repository accessible to all project members

### Search & Filtering
- **Name Search**: Find contacts by name instantly
- **Content Search**: Search through note text to find specific keywords or topics
- **Date Filtering**: Filter notes by date range to focus on specific time periods
- **Combined Filters**: Use multiple filters simultaneously for precise data retrieval

### Data Export
- **CSV Export**: Download all project notes as CSV for analysis in Excel, Google Sheets, or CRM tools
- **Formatted Output**: Properly structured CSV with contact name, email, notes, creator, and timestamp

### User Experience
- **Mobile-First Design**: Fully responsive layouts optimized for smartphones and tablets
- **Intuitive Navigation**: Clean, simple interface requiring minimal training
- **Fast Performance**: Optimized data fetching and rendering with React Router v7
- **Form Validation**: Real-time email validation and required field enforcement
- **User Menu**: Easy access to settings and logout from anywhere in the app
- **Professional UI**: Polished design with consistent styling using TailwindCSS

<p align="right">(<a href="#top">back to top</a>)</p>

## Architecture

### Database Schema

The application uses a relational database structure with four main entities:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (unique)      │
│ password (hashed)   │
│ name                │
│ createdAt           │
└─────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────┐        ┌─────────────────────┐
│   ProjectMember     │◄───────│      Project        │
├─────────────────────┤  N:1   ├─────────────────────┤
│ id (PK)             │        │ id (PK)             │
│ userId (FK)         │        │ name                │
│ projectId (FK)      │        │ description         │
│ role                │        │ ownerId (FK→User)   │
│ joinedAt            │        │ createdAt           │
└─────────────────────┘        │ updatedAt           │
         │                     └─────────────────────┘
         │                              │
         │                              │ 1:N
         │                              │
         │                              ▼
         │                     ┌─────────────────────┐
         └─────────────────────►  CanvassingNote     │
                          N:1  ├─────────────────────┤
                               │ id (PK)             │
                               │ projectId (FK)      │
                               │ userId (FK)         │
                               │ contactName         │
                               │ contactEmail        │
                               │ notes (text)        │
                               │ createdAt           │
                               │ updatedAt           │
                               └─────────────────────┘
```

#### Entity Descriptions

**User**
- Primary entity for authentication and authorization
- Stores hashed passwords using bcrypt
- Email must be unique (enforced at database level)

**Project**
- Represents a canvassing campaign (e.g., "Section 8 Housing", "Voter Registration")
- Has an owner (creator) and can have multiple members
- Optional description field for project details

**ProjectMember (Join Table)**
- Enables many-to-many relationship between Users and Projects
- One user can be part of multiple projects
- One project can have multiple users
- Stores role information (e.g., "owner", "member")
- Tracks when user joined the project

**CanvassingNote**
- Core entity storing canvassing interaction data
- Links to both Project and User (creator of note)
- contactName: Required - person canvasser talked to
- contactEmail: Optional - validated email address
- notes: Required - free-form text area (12 rows in UI)
- createdAt: Timestamp of when note was created (tracks canvassing date)
- updatedAt: Timestamp of last edit

#### Key Relationships

1. **User → ProjectMember**: One-to-many (a user can be member of many projects)
2. **Project → ProjectMember**: One-to-many (a project can have many members)
3. **User → CanvassingNote**: One-to-many (a user creates many notes)
4. **Project → CanvassingNote**: One-to-many (a project contains many notes)

This schema enables:
- Multi-user collaboration on projects
- Tracking which user created which notes
- Viewing all notes in a project across all team members
- User-level data isolation (users only see projects they're part of)

<p align="right">(<a href="#top">back to top</a>)</p>

### Page Structure & Routes

```
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTE STRUCTURE                         │
└─────────────────────────────────────────────────────────────────┘

/ (Login/Register)
│
├─ Public Routes (Unauthenticated)
│  └─ / ...................... Login & Registration Page
│
└─ Protected Routes (Authenticated)
   │
   ├─ /dashboard ............ Dashboard (Project List)
   │
   ├─ /projects/:projectId .. Project Detail (Notes List)
   │  │
   │  ├─ /projects/:projectId/notes/new ....... Create New Note
   │  │
   │  └─ /projects/:projectId/notes/:noteId ... View/Edit Note
   │
   ├─ /settings ............. User Settings
   │
   └─ /logout ............... Logout Action
```

#### Route Details

**`/` - Login/Register Page (Public)**
- Split view or tabbed interface for login and registration
- **Login Form**:
  - Email input (validated)
  - Password input
  - "Remember me" checkbox (optional)
  - Submit button
- **Register Form**:
  - Name input
  - Email input (validated, uniqueness checked)
  - Password input (minimum length requirement)
  - Confirm password input
  - Submit button
- Form validation with error messages
- Redirects to `/dashboard` after successful authentication
- Mobile-optimized form layouts

**`/dashboard` - Dashboard (Protected)**
- **Header**:
  - App logo/title
  - User avatar (top-right corner) with dropdown menu:
    - User name and email display
    - Settings link → `/settings`
    - Logout link → `/logout`
- **Main Content**:
  - "Create New Project" button (prominent)
  - Grid/list of user's projects:
    - Project name
    - Description (truncated)
    - Member count (e.g., "5 members")
    - Note count (e.g., "23 notes")
    - Last updated timestamp
    - Click → navigates to `/projects/:projectId`
  - Empty state: "No projects yet. Create your first project!"
- **Mobile**: Stacked cards, hamburger menu for user menu

**`/projects/:projectId` - Project Detail (Protected)**
- **Header**:
  - Back button → `/dashboard`
  - Project name (editable for owner)
  - User avatar menu (top-right)
- **Action Bar**:
  - "Add Note" button (prominent, sticky on mobile)
  - "Export CSV" button
  - "Manage Members" button (for project owner)
- **Filters**:
  - Search bar (searches contactName and notes content)
  - Date range picker (filter by createdAt)
  - User filter dropdown (show notes by specific member)
- **Notes List**:
  - Table/card view of all notes:
    - Contact name
    - Contact email (if provided)
    - Note preview (truncated to ~100 chars)
    - Created by (user name)
    - Created date
    - Click → navigates to `/projects/:projectId/notes/:noteId`
  - Pagination or infinite scroll
  - Empty state: "No notes yet. Start canvassing!"
- **Member Sidebar** (collapsible on mobile):
  - List of project members with avatars
  - "Invite Member" button (for owner)
- **Mobile**: Filters in collapsible accordion, cards instead of table

**`/projects/:projectId/notes/new` - Create New Note (Protected)**
- **Header**:
  - Back button → `/projects/:projectId`
  - "New Note" title
- **Form**:
  - Contact Name input (required)
  - Contact Email input (optional, validated for proper email format)
  - Notes textarea (12 rows, required, placeholder: "What did you discuss?")
  - Date display (read-only, auto-filled with current date/time)
  - Save button (validates required fields)
  - Cancel button (returns to project)
- **Validation**:
  - Real-time email validation
  - Required field indicators
  - Error messages inline
- **Mobile**: Full-screen form, sticky save/cancel buttons

**`/projects/:projectId/notes/:noteId` - View/Edit Note (Protected)**
- **View Mode** (default):
  - Display all note fields (read-only)
  - Created by and date information
  - "Edit" button (only visible to note creator or project owner)
  - "Delete" button (only visible to note creator or project owner)
  - "Back" button → `/projects/:projectId`
- **Edit Mode** (after clicking "Edit"):
  - Same form as create note
  - Pre-filled with existing data
  - Save button (updates note)
  - Cancel button (returns to view mode)
- **Delete Confirmation**:
  - Modal/dialog: "Are you sure you want to delete this note?"
  - Confirm/Cancel buttons
  - On confirm → deletes note and redirects to `/projects/:projectId`
- **Mobile**: Full-screen view/edit

**`/settings` - User Settings (Protected)**
- **Profile Section**:
  - Name input (editable)
  - Email display (not editable)
  - Save changes button
- **Password Section**:
  - Current password input
  - New password input
  - Confirm new password input
  - Update password button
- **Account Section**:
  - Account created date
  - Delete account button (with confirmation)
- **Back** button → `/dashboard`

**`/logout` - Logout Action (Protected)**
- Destroys user session
- Redirects to `/` (login page)
- Shows success message: "You've been logged out"

<p align="right">(<a href="#top">back to top</a>)</p>

## Project Setup

Follow these steps to get a local development environment up and running.

### Prerequisites

Ensure you have the following installed on your system:

* **Node.js 18+**: [Download & Install Node.js](https://nodejs.org/)
* **npm 9+** (comes with Node.js)
* **Git**: [Download & Install Git](https://git-scm.com/)
* **Docker & Docker Compose**: [Download & Install Docker](https://docs.docker.com/get-docker/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd empowered_canvass
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start MySQL database with Docker:**
   ```sh
   docker-compose up -d
   ```

   This will start a MySQL 8 container with:
   - Container name: `empowered-mysql`
   - Port: `3306`
   - Database name: `empowered_canvass`
   - Root password: `password`
   - Persistent data storage in Docker volume

4. **Setup environment variables:**
   Create a `.env` file in the project root:
   ```env
   # Session Secret (generate a random string)
   SESSION_SECRET=your-super-secure-random-string

   # Database URL (MySQL via Docker)
   DATABASE_URL="mysql://root:password@localhost:3306/empowered_canvass"

   # App URL (for development)
   APP_URL=http://localhost:5173
   ```

5. **Initialize the database:**
   ```sh
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed database with sample data
   npx prisma db seed
   ```

6. **Start the development server:**
   ```sh
   npm run dev
   ```

7. **Access the application:**
   - Open your browser and navigate to: **http://localhost:5173**
   - Prisma Studio (database GUI): `npx prisma studio` → http://localhost:5555

### Docker Commands

Useful Docker commands for managing the MySQL database:

```sh
# Start MySQL container
docker-compose up -d

# Stop MySQL container
docker-compose down

# View MySQL logs
docker logs empowered-mysql

# Stop and remove container with data
docker-compose down -v

# Access MySQL CLI
docker exec -it empowered-mysql mysql -uroot -ppassword empowered_canvass
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Development

### Project Structure

```
empowered_canvass/
├── app/
│   ├── routes/              # All page routes
│   │   ├── login.tsx        # Login page
│   │   ├── register.tsx     # Registration page
│   │   ├── dashboard.tsx    # Project list
│   │   ├── projects.new.tsx # Create new project
│   │   ├── projects.$projectId.tsx      # Project detail
│   │   ├── projects.$projectId.notes.new.tsx  # New note
│   │   ├── projects.$projectId.notes.$noteId.tsx  # View/edit note
│   │   └── projects.$projectId.export-csv.tsx  # CSV export
│   ├── components/          # Reusable UI components
│   │   └── ui/              # UI primitives (Button, Card, Modal, Input, Alert, etc.)
│   ├── hooks/               # Custom React hooks
│   │   ├── useToggle.ts     # Boolean state management
│   │   ├── useFormSubmitting.ts  # Form submission state
│   │   ├── useSearch.ts     # Client-side search functionality
│   │   └── index.ts         # Hook exports
│   ├── utils/               # Utility functions
│   │   ├── db.server.ts     # Prisma client
│   │   ├── auth.server.ts   # Authentication utilities
│   │   ├── session.server.ts # Session management
│   │   └── validation.ts    # Custom validation functions
│   ├── app.css              # Global styles and Tailwind imports
│   └── root.tsx             # App root component
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed data
├── .env                     # Environment variables
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

### Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Format code with Prettier
npm run format

# Build for production
npm run build

# Start production server
npm start
```

### Database Management

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Reset database (warning: deletes all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# View migration status
npx prisma migrate status
```

### Adding New Features

1. **Create route**: Add file in `app/routes/`
2. **Define schema**: Update `prisma/schema.prisma` if needed
3. **Create migration**: Run `npx prisma migrate dev`
4. **Build UI**: Use TailwindCSS and components from `app/components/`
5. **Add validation**: Create custom validation functions in `app/utils/validation.ts`
6. **Test**: Manually test all functionality on desktop and mobile

<p align="right">(<a href="#top">back to top</a>)</p>

## Contact

For questions about this project, please contact the developer.


## Video Demo

https://github.com/user-attachments/assets/1c3c0d7b-01f3-414b-9373-d67ecc153830



**Project Repository**: [[Empowered Canvass](https://github.com/NasirAbdirahman/empowered-canvass)]

<p align="right">(<a href="#top">back to top</a>)</p>
