const { writePerson, TAGS, NEWLINE } = require('../src/converter');

describe('writePerson', () => {
  let mockStream;

  beforeEach(() => {
    mockStream = { write: jest.fn() };
  });

  test('writes person with name, address and phone', () => {
    const person = {
      firstName: "Anna",
      lastName: "Karlsson",
      address: {
        street: "Storgatan 1",
        city: "Stockholm",
        zip: "12345"
      },
      phone: {
        mobile: "0701234567",
        landline: "081234567"
      },
      family: []
    };

    writePerson(mockStream, person);

    const written = mockStream.write.mock.calls.flat().join('');
    expect(written).toContain(`<${TAGS.firstName}>${person.firstName}</${TAGS.firstName}>`);
    expect(written).toContain(`<${TAGS.lastName}>${person.lastName}</${TAGS.lastName}>`);
    expect(written).toContain(`<${TAGS.street}>${person.address.street}</${TAGS.street}>`);
    expect(written).toContain(`<${TAGS.city}>${person.address.city}</${TAGS.city}>`);
    expect(written).toContain(`<${TAGS.zip}>${person.address.zip}</${TAGS.zip}>`);
    expect(written).toContain(`<${TAGS.mobile}>${person.phone.mobile}</${TAGS.mobile}>`);
    expect(written).toContain(`<${TAGS.landline}>${person.phone.landline}</${TAGS.landline}>`);
  });

  test('writes family with address and mobile without landline', () => {
    const person = {
      firstName: "Bo",
      lastName: "Svensson",
      family: [
        {
          name: "Lisa",
          birthYear: "2010",
          address: {
            street: "Bokvägen 2",
            city: "Malmö",
            zip: "54321"
          },
          phone: {
            mobile: "0707654321",
            landline: ""
          }
        }
      ]
    };

    writePerson(mockStream, person);

    const written = mockStream.write.mock.calls.flat().join('');
    const f = person.family[0];

    expect(written).toContain(`<${TAGS.name}>${f.name}</${TAGS.name}>`);
    expect(written).toContain(`<${TAGS.born}>${f.birthYear}</${TAGS.born}>`);
    expect(written).toContain(`<${TAGS.street}>${f.address.street}</${TAGS.street}>`);
    expect(written).toContain(`<${TAGS.city}>${f.address.city}</${TAGS.city}>`);
    expect(written).toContain(`<${TAGS.zip}>${f.address.zip}</${TAGS.zip}>`);
    expect(written).toContain(`<${TAGS.mobile}>${f.phone.mobile}</${TAGS.mobile}>`);
    expect(written).toContain(`<${TAGS.landline} />`);
  });
});
