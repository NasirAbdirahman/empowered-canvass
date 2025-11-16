import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword } from "~/utils/validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "123@example.com",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBeUndefined();
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
        "user@.com",
        "",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBeTruthy();
        expect(typeof validateEmail(email)).toBe("string");
      });
    });

    it("should return error message for invalid emails", () => {
      const error = validateEmail("invalid");
      expect(error).toBe("Invalid email address format");
    });

    it("should be case insensitive", () => {
      expect(validateEmail("Test@Example.COM")).toBeUndefined();
    });
  });

  describe("validatePassword", () => {
    it("should accept valid passwords", () => {
      const validPasswords = [
        "Password123!",
        "SuperSecure1@",
        "MyP@ssw0rd",
        "Test1234#",
      ];

      validPasswords.forEach((password) => {
        expect(validatePassword(password)).toBeUndefined();
      });
    });

    it("should reject password shorter than 8 characters", () => {
      expect(validatePassword("Pass1!")).toBe(
        "Password must be at least 8 characters long"
      );
    });

    it("should reject password without uppercase letter", () => {
      expect(validatePassword("password123!")).toBe(
        "Password must contain uppercase, lowercase, number, and special character"
      );
    });

    it("should reject password without lowercase letter", () => {
      expect(validatePassword("PASSWORD123!")).toBe(
        "Password must contain uppercase, lowercase, number, and special character"
      );
    });

    it("should reject password without number", () => {
      expect(validatePassword("Password!")).toBe(
        "Password must contain uppercase, lowercase, number, and special character"
      );
    });

    it("should reject password without special character", () => {
      expect(validatePassword("Password123")).toBe(
        "Password must contain uppercase, lowercase, number, and special character"
      );
    });

    it("should reject empty password", () => {
      expect(validatePassword("")).toBe(
        "Password is required"
      );
    });
  });
});
