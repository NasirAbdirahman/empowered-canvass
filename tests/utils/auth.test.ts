import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "~/utils/auth.server";

describe("Authentication Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testPassword123";
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Hashes should be different due to salt
      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty password", async () => {
      const password = "";
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed.length).toBeGreaterThan(0);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testPassword123";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });

    it("should be case sensitive", async () => {
      const password = "TestPassword123";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword("testpassword123", hashed);

      expect(isValid).toBe(false);
    });

    it("should handle empty password verification", async () => {
      const password = "";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword("", hashed);

      expect(isValid).toBe(true);
    });
  });
});
