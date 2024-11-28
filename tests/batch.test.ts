import { afterAll, beforeEach, describe, expect, test } from "vitest";
import {
  config,
  getClient,
  clearAllIndexes,
} from "./utils/meilisearch-test-utils";

const index = {
  uid: "batch-test",
};

afterAll(() => {
  return clearAllIndexes(config);
});

describe.each([{ permission: "Master" }, { permission: "Admin" }])(
  "Tests on batches",
  ({ permission }) => {
    beforeEach(async () => {
      const client = await getClient("Master");
      const { taskUid } = await client.createIndex(index.uid);
      await client.waitForTask(taskUid);
    });

    test(`${permission} key: Get one batch`, async () => {
      const client = await getClient(permission);
      const batch = await client.getBatch(1);
      expect(batch.uid).toEqual(1);
      expect(batch.details).toHaveProperty("receivedDocuments");
      expect(batch.details).toHaveProperty("indexedDocuments");
      expect(batch.stats).toHaveProperty("totalNbTasks");
      expect(batch.stats).toHaveProperty("status");
      expect(batch.stats).toHaveProperty("types");
      expect(batch.stats).toHaveProperty("indexUids");
      expect(batch.duration).toBeDefined();
      expect(batch.startedAt).toBeDefined();
      expect(batch.finishedAt).toBeDefined();
    });

    test(`${permission} key: Get all batches`, async () => {
      const client = await getClient(permission);
      const batches = await client.getBatches({ limit: 2 });
      expect(batches.results).toBeInstanceOf(Array);
      expect(batches.results.length).toEqual(2);
      expect(batches.total).toBeGreaterThan(0);
      expect(batches.results[0]).toHaveProperty("uid");
      expect(batches.results[0]).toHaveProperty("details");
      expect(batches.results[0]).toHaveProperty("stats");
      expect(batches.results[0]).toHaveProperty("duration");
      expect(batches.results[0]).toHaveProperty("startedAt");
      expect(batches.results[0]).toHaveProperty("finishedAt");
    });
  },
);
