import { test, expect } from "@playwright/test";

/*
Wait for comments and random user to be fetched before starting tests
*/
test.beforeEach(async ({ page, browserName }, testInfo) => {
  await Promise.all([
    page.waitForResponse("/api/comments"),
    page.waitForResponse("https://randomuser.me/api/"),
    page.goto("/"),
  ]);

  const content = `${testInfo.title}-${browserName}`;
  await page.fill("#content", `${content}`);
  await Promise.all([
    page.waitForResponse("/api/comments"),
    page.locator("#comment-form button").click(),
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

test("should add upvote to comment", async ({
  page,
  browserName,
}, testInfo) => {
  // check current upvotes is 0
  const content = `${testInfo.title}-${browserName}`;
  const comment = page.locator(`article:has-text("${content}")`);
  const commentId = await comment.getAttribute("data-commentid");
  await expect(comment).toHaveCount(1);
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);

  // click upvote
  await Promise.all([
    page.waitForResponse(`/api/comments/${commentId}`),
    comment.locator(`#upvote-${commentId}`).click(),
  ]);

  // check new upvotes is 1
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(1);
});

test("should remove upvote for comment", async ({
  page,
  browserName,
}, testInfo) => {
  // check current upvote is 0
  const content = `${testInfo.title}-${browserName}`;
  const comment = page.locator(`article:has-text("${content}")`);
  const commentId = await comment.getAttribute("data-commentid");
  await expect(comment).toHaveCount(1);
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);

  // click upvote
  const upvoteButton = comment.locator(`#upvote-${commentId}`);
  await Promise.all([
    page.waitForResponse(`/api/comments/${commentId}`),
    upvoteButton.click(),
  ]);

  // check upvotes is 1
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(1);

  // click upvote again (downvote)
  await Promise.all([
    page.waitForResponse(`/api/comments/${commentId}`),
    upvoteButton.click(),
  ]);

  // check upvotes is 0 again
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
});

test("should show live upvotes across windows", async ({
  page,
  browserName,
  context,
}, testInfo) => {
  // create a second tab and get ref to same comment
  const pageTwo = await context.newPage();
  await Promise.all([
    pageTwo.waitForResponse("/api/comments"),
    pageTwo.goto("/"),
  ]);
  const content = `${testInfo.title}-${browserName}`;
  const comment = page.locator(`article:has-text("${content}")`);
  const commentId = await comment.getAttribute("data-commentid");
  const commentTwo = pageTwo.locator(`article:has-text("${content}")`);

  // check both upvotes for the comment are 0
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
  expect(Number(await commentTwo.locator("span.upvotes").innerText())).toBe(0);

  // click upvote on the first page
  const upvoteButton = comment.locator(`#upvote-${commentId}`);
  await Promise.all([
    page.waitForResponse(`/api/comments/${commentId}`),
    upvoteButton.click(),
  ]);

  // check both tabs show 1 for the upvotes of the comment
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(1);
  expect(Number(await commentTwo.locator("span.upvotes").innerText())).toBe(1);

  // click upvote (downvote) again
  await Promise.all([
    page.waitForResponse(`/api/comments/${commentId}`),
    upvoteButton.click(),
  ]);

  // check both tabs show 0 for the upvotes of the comment
  expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
  expect(Number(await commentTwo.locator("span.upvotes").innerText())).toBe(0);
});
