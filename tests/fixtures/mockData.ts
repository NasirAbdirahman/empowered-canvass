import type { User, Project, CanvassingNote } from "@prisma/client";

export const mockUser: User = {
  id: "test-user-1",
  email: "test@example.com",
  name: "Test User",
  password: "$2a$10$HASH", // bcrypt hash
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockUser2: User = {
  id: "test-user-2",
  email: "user2@example.com",
  name: "User Two",
  password: "$2a$10$HASH2",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockProject: Project = {
  id: "test-project-1",
  name: "Test Project",
  description: "A test project for canvassing",
  ownerId: "test-user-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockNote: CanvassingNote = {
  id: "test-note-1",
  contactName: "John Doe",
  contactEmail: "john@example.com",
  notes: "Had a great conversation about the campaign",
  projectId: "test-project-1",
  userId: "test-user-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockNotes: CanvassingNote[] = [
  mockNote,
  {
    id: "test-note-2",
    contactName: "Jane Smith",
    contactEmail: "jane@example.com",
    notes: "Interested in volunteering",
    projectId: "test-project-1",
    userId: "test-user-1",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "test-note-3",
    contactName: "Bob Johnson",
    contactEmail: null,
    notes: "Not home, will follow up later",
    projectId: "test-project-1",
    userId: "test-user-1",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
];
