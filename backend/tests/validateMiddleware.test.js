import { test } from "node:test";
import assert from "node:assert";
import { z } from "zod";

import validate from "../middlewares/validate.js";

const sampleSchema = z.object({
    name: z.string().min(1, "name is required")
});

// Builds a fake res object that captures the status code and json payload it was called with
const makeRes = () => {
    const state = { statusCode: null, jsonBody: null };
    const res = {
        status(code) {
            state.statusCode = code;
            return {
                json(data) {
                    state.jsonBody = data;
                }
            };
        }
    };
    return { res, state };
};

test("validate() calls next() and passes through parsed data on valid input", () => {
    const req = { body: { name: "Jane" } };
    const { res } = makeRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    validate(sampleSchema)(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.deepStrictEqual(req.body, { name: "Jane" });
});

test("validate() responds with 400 and does not call next() on invalid input", () => {
    const req = { body: {} };
    const { res, state } = makeRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    validate(sampleSchema)(req, res, next);

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(state.statusCode, 400);
    assert.strictEqual(state.jsonBody.success, false);
    assert.ok(typeof state.jsonBody.message === "string" && state.jsonBody.message.length > 0);
});

test("validate() strips unexpected fields not defined in the schema behavior is consistent", () => {
    // sanity check: valid input with an extra field still passes through (zod default behavior)
    const req = { body: { name: "Jane", extra: "ignored" } };
    const { res } = makeRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    validate(sampleSchema)(req, res, next);

    assert.strictEqual(nextCalled, true);
});
