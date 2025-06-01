const { writePhone, TAGS } = require('../src/converter');

describe("writePhone", () => {
  let stream;

  beforeEach(() => {
    stream = { write: jest.fn() };
  });

  test("writePhone outputs correct phone XML", () => {
    const phone = { mobile: "123-456", landline: "789-000" };

    writePhone(stream, phone, 0);

    const written = stream.write.mock.calls.flat().join("");
    expect(written).toContain(TAGS.phoneStart);
    expect(written).toContain(`<${TAGS.mobile}>${phone.mobile}</${TAGS.mobile}>`);
    expect(written).toContain(`<${TAGS.landline}>${phone.landline}</${TAGS.landline}>`);
    expect(written).toContain(TAGS.phoneEnd);
  });

  test("writes self closing tag for mobile if value is missing", () => {
    const phone = { mobile: "", landline: "08 123 456" };

    writePhone(stream, phone, 0);

    const written = stream.write.mock.calls.flat().join("");
    expect(written).toContain(`<${TAGS.mobile} />`);
    expect(written).toContain(`<${TAGS.landline}>${phone.landline}</${TAGS.landline}>`);
  });

  test("writes self closing tag for landline if value is missing", () => {
    const phone = { mobile: "070-123 456", landline: "" };

    writePhone(stream, phone, 0);

    const written = stream.write.mock.calls.flat().join("");
    expect(written).toContain(`<${TAGS.mobile}>${phone.mobile}</${TAGS.mobile}>`);
    expect(written).toContain(`<${TAGS.landline} />`);
  });
});
