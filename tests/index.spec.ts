import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await Promise.all([
    page.waitForResponse("/api/comments"),
    page.waitForResponse("https://randomuser.me/api/"),
    page.goto("/"),
  ]);
});

test.afterEach(async ({ page, request, browserName }, testInfo) => {
  const commentToDelete = await page
    .locator(`article:has-text("${testInfo.title}-${browserName}")`)
    .getAttribute("data-commentid");
  const resp = await request.delete(`/api/comments/${commentToDelete}`);
  expect(resp.ok()).toBeTruthy();
});

test.describe("Comment", () => {
  test("should add a new comment", async ({ page, browserName }, testInfo) => {
    const name = await page
      .locator('#comment-form input[name="name"]')
      .inputValue();

    await page.fill("#content", `${testInfo.title}-${browserName}`);
    await Promise.all([
      page.waitForResponse("/api/comments"),
      page.locator("#comment-form button").click(),
    ]);

    const comment = page.locator(
      `article:has-text("${testInfo.title}-${browserName}")`
    );
    await expect(comment).toHaveCount(1);
    await expect(comment.locator("h2")).toContainText(name);
    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
  });
});

test.describe("Upvote", () => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    await page.fill("#content", `${testInfo.title}-${browserName}`);
    await Promise.all([
      page.waitForResponse("/api/comments"),
      page.locator("#comment-form button").click(),
    ]);
  });

  test("should add upvote to comment", async ({
    page,
    browserName,
  }, testInfo) => {
    const comment = page.locator(
      `article:has-text("${testInfo.title}-${browserName}")`
    );
    await expect(comment).toHaveCount(1);
    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);

    await Promise.all([
      page.waitForResponse("/api/comments"),
      await comment.locator(`button`).click(),
    ]);

    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(1);
  });
});
