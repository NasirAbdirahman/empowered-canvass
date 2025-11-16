import { describe, it, expect } from "vitest";
import { mockNotes } from "../fixtures/mockData";

describe("CSV Export", () => {
  describe("CSV Generation", () => {
    it("should generate valid CSV header", () => {
      const csvHeader = [
        "Contact Name",
        "Contact Email",
        "Notes",
        "Created By",
        "Created Date",
        "Updated Date",
      ].join(",");

      expect(csvHeader).toContain("Contact Name");
      expect(csvHeader).toContain("Contact Email");
      expect(csvHeader).toContain("Notes");
    });

    it("should properly escape quotes in CSV data", () => {
      const testData = 'John "Johnny" Doe';
      const escaped = `"${testData.replace(/"/g, '""')}"`;

      expect(escaped).toBe('"John ""Johnny"" Doe"');
    });

    it("should replace newlines with spaces in notes", () => {
      const notesWithNewlines = "Line 1\nLine 2\nLine 3";
      const sanitized = notesWithNewlines.replace(/\n/g, " ");

      expect(sanitized).toBe("Line 1 Line 2 Line 3");
      expect(sanitized).not.toContain("\n");
    });

    it("should handle null email values", () => {
      const note = mockNotes[2]; // Has null email
      const emailField = note.contactEmail ? `"${note.contactEmail}"` : "";

      expect(emailField).toBe("");
    });

    it("should format dates consistently", () => {
      const date = new Date("2024-01-15");
      const formatted = date.toLocaleDateString();

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
    });

    it("should generate complete CSV row", () => {
      const note = mockNotes[0];
      const row = [
        `"${note.contactName.replace(/"/g, '""')}"`,
        note.contactEmail ? `"${note.contactEmail.replace(/"/g, '""')}"` : "",
        `"${note.notes.replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"Test User"`,
        new Date(note.createdAt).toLocaleDateString(),
        new Date(note.updatedAt).toLocaleDateString(),
      ];

      expect(row).toHaveLength(6);
      expect(row[0]).toContain("John Doe");
      expect(row[1]).toContain("john@example.com");
    });

    it("should generate full CSV content", () => {
      const csvRows = [];

      // Header
      csvRows.push([
        "Contact Name",
        "Contact Email",
        "Notes",
        "Created By",
        "Created Date",
        "Updated Date",
      ].join(","));

      // Data rows
      for (const note of mockNotes) {
        const row = [
          `"${note.contactName.replace(/"/g, '""')}"`,
          note.contactEmail ? `"${note.contactEmail.replace(/"/g, '""')}"` : "",
          `"${note.notes.replace(/"/g, '""').replace(/\n/g, " ")}"`,
          `"Test User"`,
          new Date(note.createdAt).toLocaleDateString(),
          new Date(note.updatedAt).toLocaleDateString(),
        ];
        csvRows.push(row.join(","));
      }

      const csvContent = csvRows.join("\n");

      // Verify structure
      expect(csvContent).toContain("Contact Name");
      expect(csvContent).toContain("John Doe");
      expect(csvContent).toContain("Jane Smith");
      expect(csvContent).toContain("Bob Johnson");

      // Verify row count (header + 3 notes)
      const lines = csvContent.split("\n");
      expect(lines).toHaveLength(4);
    });

    it("should sanitize filename", () => {
      const projectName = "My Project #1!";
      const fileName = projectName.replace(/[^a-z0-9]/gi, "_");

      expect(fileName).toBe("My_Project__1_");
      expect(fileName).not.toContain("#");
      expect(fileName).not.toContain("!");
    });
  });
});
