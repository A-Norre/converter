const { escapeXml } = require('../src/converter');

test('returns the same text if it is valid', () => {
  expect(escapeXml("Test")).toBe("Test");
});

test('throws error for unaccepted characters', () => {
  expect(() => escapeXml("Olagligt & tecken")).toThrow(/Unaccepted characters in XML/);
});

test('returns correct text with numbers and allowed characters', () => {
  expect(escapeXml("Storgatan 5")).toBe("Storgatan 5");
});
