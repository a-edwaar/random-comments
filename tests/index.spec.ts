import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await Promise.all([
    page.waitForResponse("/api/comments"),
    page.waitForResponse("https://randomuser.me/api/"),
    page.goto("/"),
  ]);
});

test.afterEach(async ({ page, request, browserName }, testInfo) => {
  const content = `${testInfo.title}-${browserName}`;
  const commentToDelete = await page
    .locator(`article:has-text("${content}")`)
    .getAttribute("data-commentid");
  const resp = await request.delete(`/api/comments/${commentToDelete}`);
  expect(resp.ok()).toBeTruthy();
});

test.describe("Comment", () => {
  test("should add a new comment", async ({ page, browserName }, testInfo) => {
    const name = await page
      .locator('#comment-form input[name="name"]')
      .inputValue();

    const content = `${testInfo.title}-${browserName}`;
    await page.fill("#content", `${content}`);
    await Promise.all([
      page.waitForResponse("/api/comments"),
      page.locator("#comment-form button").click(),
    ]);

    const comment = page.locator(`article:has-text("${content}")`);
    await expect(comment).toHaveCount(1);
    await expect(comment.locator("h2")).toContainText(name);
    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
  });
});

test.describe("Upvote", () => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    const content = `${testInfo.title}-${browserName}`;
    await page.fill("#content", `${content}`);
    await Promise.all([
      page.waitForResponse("/api/comments"),
      page.locator("#comment-form button").click(),
    ]);
  });

  test("should add upvote to comment", async ({
    page,
    browserName,
  }, testInfo) => {
    const content = `${testInfo.title}-${browserName}`;
    const comment = page.locator(`article:has-text("${content}")`);
    const commentId = await comment.getAttribute("data-commentid");
    await expect(comment).toHaveCount(1);
    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);

    await Promise.all([
      page.waitForResponse(`/api/comments/${commentId}`),
      comment.locator(`button`).click(),
    ]);

    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(1);
  });

  test("should remove upvote for comment", async ({
    page,
    browserName,
  }, testInfo) => {
    const content = `${testInfo.title}-${browserName}`;
    const comment = page.locator(`article:has-text("${content}")`);
    const commentId = await comment.getAttribute("data-commentid");
    await expect(comment).toHaveCount(1);
    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);

    await Promise.all([
      page.waitForResponse(`/api/comments/${commentId}`),
      comment.locator(`button`).click(),
    ]);

    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(1);

    await Promise.all([
      page.waitForResponse(`/api/comments/${commentId}`),
      comment.locator(`button`).click(),
    ]);

    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
  });

  test("should show live upvotes across windows", async ({
    page,
    browserName,
    context,
  }, testInfo) => {
    const pageTwo = await context.newPage();
    await Promise.all([
      pageTwo.waitForResponse("/api/comments"),
      pageTwo.goto("/"),
    ]);

    const content = `${testInfo.title}-${browserName}`;
    const comment = page.locator(`article:has-text("${content}")`);
    const commentId = await comment.getAttribute("data-commentid");
    const commentTwo = pageTwo.locator(`article:has-text("${content}")`);

    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
    expect(Number(await commentTwo.locator("span.upvotes").innerText())).toBe(
      0
    );

    await Promise.all([
      page.waitForResponse(`/api/comments/${commentId}`),
      comment.locator(`button`).click(),
    ]);

    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(1);
    expect(Number(await commentTwo.locator("span.upvotes").innerText())).toBe(
      1
    );

    await Promise.all([
      page.waitForResponse(`/api/comments/${commentId}`),
      comment.locator(`button`).click(),
    ]);

    expect(Number(await comment.locator("span.upvotes").innerText())).toBe(0);
    expect(Number(await commentTwo.locator("span.upvotes").innerText())).toBe(
      0
    );
  });
});
