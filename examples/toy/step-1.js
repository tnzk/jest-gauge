test('User must be logged in as <role>', (role) => {
  expect(role).toMatch(/customer|admin|superviser/);
});

test('Open the product search page', async () => {
  expect(1).toBe(1);
});

test('Search for product "Cup Cakes"', async () => {
  expect(1).toBe(1);
});

test('"Cup Cakes" should show up in the search results', async () => {
  expect(1).toBe(1);
});

test('A context step', async () => {
  expect(1).toBe(1);
});