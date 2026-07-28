import { test } from "node:test";
import assert from "node:assert";

import createVideoRoom from "../utils/dailyVideo.js";

test("createVideoRoom() returns null when DAILY_API_KEY is not set", async () => {
    // guarantee the "not configured" path is hit, regardless of the environment this runs in
    delete process.env.DAILY_API_KEY;

    const result = await createVideoRoom();

    assert.strictEqual(result, null);
});
