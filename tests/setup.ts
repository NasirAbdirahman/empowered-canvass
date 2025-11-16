import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.SESSION_SECRET = "test-session-secret-for-testing-only";
process.env.NODE_ENV = "test";
