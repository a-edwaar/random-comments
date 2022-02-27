import { test, expect } from "@playwright/test";

/*
Wait for comments and random user to be fetched before starting tests
*/
test.beforeEach(async ({ page }) => {
  await Promise.all([
    page.waitForResponse("/api/comments"),
    page.waitForResponse("https://randomuser.me/api/"),
    page.goto("/"),
  ]);
});

/*
Clean up after each test by deleting parent comment. All replies will be deleted automatically.
*/
test.afterEach(async ({ page, request, browserName }, testInfo) => {
  const content = `${testInfo.title}-${browserName}`;
  const commentToDelete = await page
    .locator(`article:has-text("${content}")`)
    .getAttribute("data-commentid");
  const resp = await request.delete(`/api/comments/${commentToDelete}`);
  expect(resp.ok()).toBeTruthy();
});

test("should add a new comment", async ({ page, browserName }, testInfo) => {
  // gather info about comment to be created
  const name = await page
    .locator('#comment-form input[name="name"]')
    .inputValue();
  const content = `${testInfo.title}-${browserName}`;

  // create comment
  await page.fill("#content", `${content}`);
  await Promise.all([
    page.waitForResponse("/api/comments"),
    page.locator("#comment-form button").click(),
  ]);

  // check content of new comment matches with what we created
  const comment = page.locator(`article:has-text("${content}")`);
  await expect(comment).toHaveCount(1);
  await expect(comment.locator("h2")).toContainText(name);
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
});
