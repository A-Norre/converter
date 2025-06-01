const { writeAddress, TAGS } = require('../src/converter');

test("writeAddress outputs correct address XML", () => {
  const stream = { write: jest.fn() };
  const address = { street: "Main St", city: "Springfield", zip: "12345" };

  writeAddress(stream, address, 0);

  const written = stream.write.mock.calls.flat().join("");

  expect(written).toContain(TAGS.addressStart);
  expect(written).toContain(`<${TAGS.street}>${address.street}</${TAGS.street}>`);
  expect(written).toContain(`<${TAGS.city}>${address.city}</${TAGS.city}>`);
  expect(written).toContain(`<${TAGS.zip}>${address.zip}</${TAGS.zip}>`);
  expect(written).toContain(TAGS.addressEnd);
});

test("writeAddress outputs correct address XML with closed street-tag", () => {
  const stream = { write: jest.fn() };
  const address = { street: "", city: "Springfield", zip: "12345" };

  writeAddress(stream, address, 0);

  const written = stream.write.mock.calls.flat().join("");

  expect(written).toContain(TAGS.addressStart);
  expect(written).toContain(`<${TAGS.street} />`);
  expect(written).toContain(`<${TAGS.city}>${address.city}</${TAGS.city}>`);
  expect(written).toContain(`<${TAGS.zip}>${address.zip}</${TAGS.zip}>`);
  expect(written).toContain(TAGS.addressEnd);
});

test("writeAddress outputs correct address XML with closed city-tag", () => {
  const stream = { write: jest.fn() };
  const address = { street: "Main St", city: "", zip: "12345" };

  writeAddress(stream, address, 0);

  const written = stream.write.mock.calls.flat().join("");

  expect(written).toContain(TAGS.addressStart);
  expect(written).toContain(`<${TAGS.street}>${address.street}</${TAGS.street}>`);
  expect(written).toContain(`<${TAGS.city} />`);
  expect(written).toContain(`<${TAGS.zip}>${address.zip}</${TAGS.zip}>`);
  expect(written).toContain(TAGS.addressEnd);
});

test("writeAddress outputs correct address XML with closed zip-tag", () => {
  const stream = { write: jest.fn() };
  const address = { street: "Main St", city: "Springfield", zip: "" };

  writeAddress(stream, address, 0);

  const written = stream.write.mock.calls.flat().join("");

  expect(written).toContain(TAGS.addressStart);
  expect(written).toContain(`<${TAGS.street}>${address.street}</${TAGS.street}>`);
  expect(written).toContain(`<${TAGS.city}>${address.city}</${TAGS.city}>`);
  expect(written).toContain(`<${TAGS.zip} />`);
  expect(written).toContain(TAGS.addressEnd);
});
