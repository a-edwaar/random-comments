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

test("should reply to a comment", async ({ page, browserName }, testInfo) => {
  // get comment info
  const content = `${testInfo.title}-${browserName}`;
  const comment = page.locator(`article:has-text("${content}")`);
  const commentId = await comment.getAttribute("data-commentid");
  await expect(comment).toHaveCount(1);
  await expect(comment.locator("article")).toHaveCount(0); // 0 replies

  // write a reply
  await comment.locator(`#reply-button-${commentId}`).click();
  const replyForm = comment.locator(`#reply-form-${commentId}`);
  const replyFormInput = replyForm.locator('input[type="text"]');
  await expect(replyFormInput).toBeFocused();
  const replyContent = "writing a reply in my test!";
  await replyFormInput.fill(replyContent);
  await Promise.all([
    page.waitForResponse("/api/comments"),
    replyForm.locator("button").click(),
  ]);

  // check new reply is shown under the comment
  await expect(
    comment.locator(`article:has-text("${replyContent}")`)
  ).toHaveCount(1);
});

test("should stay one level deep when replying to a reply", async ({
  page,
  browserName,
}, testInfo) => {
  // get comment info
  const content = `${testInfo.title}-${browserName}`;
  const comment = page.locator(`article:has-text("${content}")`);
  const commentId = await comment.getAttribute("data-commentid");
  await expect(comment).toHaveCount(1);
  await expect(comment.locator("article")).toHaveCount(0);

  // write a reply
  await comment.locator(`#reply-button-${commentId}`).click();
  const replyForm = comment.locator(`#reply-form-${commentId}`);
  const replyFormInput = replyForm.locator('input[type="text"]');
  await expect(replyFormInput).toBeFocused();
  const replyContent = "writing a reply in my test!";
  await replyFormInput.fill(replyContent);
  await Promise.all([
    page.waitForResponse("/api/comments"),
    replyForm.locator("button").click(),
  ]);

  // write a reply to the reply
  const reply = comment.locator(`article:has-text("${replyContent}")`);
  await expect(reply).toHaveCount(1);
  const replyId = await reply.getAttribute("data-commentid");
  await reply.locator(`#reply-button-${replyId}`).click();
  await expect(replyFormInput).toBeFocused();
  const replyToReplyContent = "writing a reply to a reply in my test!";
  await replyFormInput.fill(replyToReplyContent);
  await Promise.all([
    page.waitForResponse("/api/comments"),
    replyForm.locator("button").click(),
  ]);

  // check reply has come under the original comment and not the reply
  await expect(
    reply.locator(`article:has-text("${replyToReplyContent}")`)
  ).toHaveCount(0);
  await expect(
    comment.locator(`article:has-text("${replyToReplyContent}")`)
  ).toHaveCount(1);
});
