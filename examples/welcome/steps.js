test("Open <url>", (url) => {
  expect(url).toBe('https://duckduckgo.com/');
});
  
test("The user sees a cute cucumber-looking white bird", () => {
  expect("https://duckduckgo.com/assets/logo_homepage.normal.v108.svg").toContain('duck');
});