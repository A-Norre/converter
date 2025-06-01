const { writeFamily, TAGS } = require('../src/converter');

test("writeFamily outputs correct family XML", () => {
  const stream = { write: jest.fn() };
  const family = [{
    name: "Anna",
    birthYear: "2000",
    address: { street: "Elm", city: "Oslo", zip: "45678" },
    phone: { mobile: "111-222", landline: "333-444" }
  }];

  writeFamily(stream, family);

  const written = stream.write.mock.calls.flat().join("");
  const f = family[0];

  expect(written).toContain(TAGS.familyStart);
  expect(written).toContain(`<${TAGS.name}>${f.name}</${TAGS.name}>`);
  expect(written).toContain(`<${TAGS.born}>${f.birthYear}</${TAGS.born}>`);
  expect(written).toContain(`<${TAGS.street}>${f.address.street}</${TAGS.street}>`);
  expect(written).toContain(`<${TAGS.city}>${f.address.city}</${TAGS.city}>`);
  expect(written).toContain(`<${TAGS.zip}>${f.address.zip}</${TAGS.zip}>`);
  expect(written).toContain(`<${TAGS.mobile}>${f.phone.mobile}</${TAGS.mobile}>`);
  expect(written).toContain(`<${TAGS.landline}>${f.phone.landline}</${TAGS.landline}>`);
  expect(written).toContain(TAGS.familyEnd);
});

test("writeFamily outputs family XML with only address", () => {
  const stream = { write: jest.fn() };
  const family = [{
    name: "Elsa",
    birthYear: "1995",
    address: { street: "Birch Lane", city: "Göteborg", zip: "55555" }
  }];

  writeFamily(stream, family);

  const written = stream.write.mock.calls.flat().join("");
  const f = family[0];

  expect(written).toContain(TAGS.familyStart);
  expect(written).toContain(`<${TAGS.name}>${f.name}</${TAGS.name}>`);
  expect(written).toContain(`<${TAGS.born}>${f.birthYear}</${TAGS.born}>`);
  expect(written).toContain(`<${TAGS.street}>${f.address.street}</${TAGS.street}>`);
  expect(written).toContain(`<${TAGS.city}>${f.address.city}</${TAGS.city}>`);
  expect(written).toContain(`<${TAGS.zip}>${f.address.zip}</${TAGS.zip}>`);
  expect(written).toContain(TAGS.familyEnd);
});

test("writeFamily outputs family XML with only phone", () => {
  const stream = { write: jest.fn() };
  const family = [{
    name: "Erik",
    birthYear: "1988",
    phone: { mobile: "999-888", landline: "777-666" }
  }];

  writeFamily(stream, family);

  const written = stream.write.mock.calls.flat().join("");
  const f = family[0];

  expect(written).toContain(TAGS.familyStart);
  expect(written).toContain(`<${TAGS.name}>${f.name}</${TAGS.name}>`);
  expect(written).toContain(`<${TAGS.born}>${f.birthYear}</${TAGS.born}>`);
  expect(written).toContain(`<${TAGS.mobile}>${f.phone.mobile}</${TAGS.mobile}>`);
  expect(written).toContain(`<${TAGS.landline}>${f.phone.landline}</${TAGS.landline}>`);
  expect(written).toContain(TAGS.familyEnd);
});
