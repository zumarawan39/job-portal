import { test } from "node:test";
import assert from "node:assert";

import { registerSchema, loginSchema, updateProfileSchema, toggleTwoFactorSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/authValidators.js";
import { postJobSchema } from "../validators/jobValidators.js";
import { registerCompanySchema, updateCompanySchema } from "../validators/companyValidators.js";
import { updateStatusSchema, scheduleInterviewSchema } from "../validators/applicationValidators.js";

// --- authValidators.js ---

test("registerSchema succeeds on valid input", () => {
    const result = registerSchema.safeParse({
        fullname: "Jane Doe",
        email: "jane@example.com",
        phoneNumber: "1234567890",
        password: "secret123",
        role: "student"
    });
    assert.strictEqual(result.success, true);
});

test("registerSchema fails on missing fullname", () => {
    const result = registerSchema.safeParse({
        email: "jane@example.com",
        phoneNumber: "1234567890",
        password: "secret123",
        role: "student"
    });
    assert.strictEqual(result.success, false);
});

test("registerSchema fails on invalid email", () => {
    const result = registerSchema.safeParse({
        fullname: "Jane Doe",
        email: "not-an-email",
        phoneNumber: "1234567890",
        password: "secret123",
        role: "student"
    });
    assert.strictEqual(result.success, false);
});

test("loginSchema fails on invalid role enum", () => {
    const result = loginSchema.safeParse({
        email: "jane@example.com",
        password: "secret123",
        role: "manager"
    });
    assert.strictEqual(result.success, false);
});

test("updateProfileSchema succeeds with all fields empty (partial update)", () => {
    const result = updateProfileSchema.safeParse({});
    assert.strictEqual(result.success, true);
});

test("updateProfileSchema succeeds with a comma-separated skills string", () => {
    const result = updateProfileSchema.safeParse({ skills: "js,node,react" });
    assert.strictEqual(result.success, true);
});

test("updateProfileSchema fails on invalid email when provided", () => {
    const result = updateProfileSchema.safeParse({ email: "bad-email" });
    assert.strictEqual(result.success, false);
});

test("toggleTwoFactorSchema succeeds on boolean", () => {
    const result = toggleTwoFactorSchema.safeParse({ enabled: true });
    assert.strictEqual(result.success, true);
});

test("toggleTwoFactorSchema fails on non-boolean", () => {
    const result = toggleTwoFactorSchema.safeParse({ enabled: "yes" });
    assert.strictEqual(result.success, false);
});

test("forgotPasswordSchema fails on missing email", () => {
    const result = forgotPasswordSchema.safeParse({});
    assert.strictEqual(result.success, false);
});

test("resetPasswordSchema fails on short password", () => {
    const result = resetPasswordSchema.safeParse({ password: "123" });
    assert.strictEqual(result.success, false);
});

test("resetPasswordSchema succeeds on valid password", () => {
    const result = resetPasswordSchema.safeParse({ password: "longenough" });
    assert.strictEqual(result.success, true);
});

// --- jobValidators.js ---

test("postJobSchema succeeds on valid input", () => {
    const result = postJobSchema.safeParse({
        title: "Backend Developer",
        description: "Build stuff",
        requirements: "Node.js",
        salary: "50000",
        location: "Remote",
        jobType: "Full-time",
        experience: "2",
        position: "1",
        companyId: "abc123"
    });
    assert.strictEqual(result.success, true);
});

test("postJobSchema fails on missing title", () => {
    const result = postJobSchema.safeParse({
        description: "Build stuff",
        requirements: "Node.js",
        salary: "50000",
        location: "Remote",
        jobType: "Full-time",
        experience: "2",
        position: "1",
        companyId: "abc123"
    });
    assert.strictEqual(result.success, false);
});

test("postJobSchema fails on negative salary", () => {
    const result = postJobSchema.safeParse({
        title: "Backend Developer",
        description: "Build stuff",
        requirements: "Node.js",
        salary: "-100",
        location: "Remote",
        jobType: "Full-time",
        experience: "2",
        position: "1",
        companyId: "abc123"
    });
    assert.strictEqual(result.success, false);
});

// --- companyValidators.js ---

test("registerCompanySchema fails on missing companyName", () => {
    const result = registerCompanySchema.safeParse({});
    assert.strictEqual(result.success, false);
});

test("registerCompanySchema succeeds on valid companyName", () => {
    const result = registerCompanySchema.safeParse({ companyName: "Acme Inc" });
    assert.strictEqual(result.success, true);
});

test("updateCompanySchema succeeds with all fields empty (partial update)", () => {
    const result = updateCompanySchema.safeParse({});
    assert.strictEqual(result.success, true);
});

test("updateCompanySchema succeeds with some fields provided", () => {
    const result = updateCompanySchema.safeParse({ name: "Acme Inc", location: "NYC" });
    assert.strictEqual(result.success, true);
});

// --- applicationValidators.js ---

test("updateStatusSchema fails on missing status", () => {
    const result = updateStatusSchema.safeParse({});
    assert.strictEqual(result.success, false);
});

test("updateStatusSchema succeeds on valid status", () => {
    const result = updateStatusSchema.safeParse({ status: "accepted" });
    assert.strictEqual(result.success, true);
});

test("scheduleInterviewSchema succeeds with all fields empty (partial update)", () => {
    const result = scheduleInterviewSchema.safeParse({});
    assert.strictEqual(result.success, true);
});

test("scheduleInterviewSchema succeeds with a loosely-formatted scheduledAt string", () => {
    const result = scheduleInterviewSchema.safeParse({ scheduledAt: "2026-08-01T10:30", meetingLink: "https://zoom.us/j/123" });
    assert.strictEqual(result.success, true);
});
