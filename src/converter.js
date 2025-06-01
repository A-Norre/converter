const fs = require("fs");
const readline = require("readline");
const {
  writePerson,
  validateZip,
  validatePhoneNumber,
  TAGS,
  INDEX,
} = require("./utils");

class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.address = null;
    this.phone = null;
    this.family = [];
  }
}

class FamilyMember {
  constructor(name, birthYear) {
    this.name = name;
    this.birthYear = birthYear;
    this.address = null;
    this.phone = null;
  }
}

class Address {
  constructor(street, city, zip) {
    this.street = street;
    this.city = city;
    this.zip = zip;
  }
}

class Phone {
  constructor(mobile, landline) {
    this.mobile = mobile;
    this.landline = landline;
  }
}

class Converter {
  constructor(inputFile, outputFile) {
    this.inputFile = inputFile;
    this.outputFile = outputFile;

    this.people = [];
    this.currentPerson = null;
    this.currentFamilyMember = null;
  }

  async convert() {
    const rl = readline.createInterface({
      input: fs.createReadStream(this.inputFile),
      crlfDelay: Infinity
    });

    const stream = fs.createWriteStream(this.outputFile, { encoding: "utf8" });
    stream.write(TAGS.rootStart);

    let lineNumber = 0;
    let lastType = null;

    for await (const line of rl) {
      lineNumber++;
      const parts = line.split("|").map(s => s.trim());
      const [type, ...rest] = parts;

      switch (type) {
        case "P":
          if (rest.length !== 2) throw new Error(`Expected 2 fields for 'P' on line ${lineNumber}: "${line}"`);
          if (this.currentPerson) {
            writePerson(stream, this.currentPerson);
          }
          this.currentPerson = new Person(rest[INDEX.P.firstName], rest[INDEX.P.lastName]);
          this.currentFamilyMember = null;
          break;

        case "F":
          if (!this.currentPerson) throw new Error(`'F' line without previous 'P' on line ${lineNumber}: "${line}"`);
          if (rest.length !== 2) throw new Error(`Expected 2 fields for 'F' on line ${lineNumber}: "${line}"`);
          const birthYear = rest[INDEX.F.born];
          if (!/^\d{4}$/.test(birthYear)) {
            throw new Error(`birthYear must be exactly 4 digits, got "${birthYear}" on line ${lineNumber}`);
          }
          this.currentFamilyMember = new FamilyMember(rest[INDEX.F.name], birthYear);
          this.currentPerson.family.push(this.currentFamilyMember);
          break;

        case "A":
          if (!this.currentPerson) throw new Error(`'A' line without previous 'P' on line ${lineNumber}: "${line}"`);
          if (rest.length !== 2 && rest.length !== 3) throw new Error(`Expected 2 or 3 fields for 'A' on line ${lineNumber}: "${line}"`);
          const zip = rest[INDEX.A.zip];
          if (!validateZip(zip)) {
            throw new Error(`Invalid zip format on line ${lineNumber}: "${zip}"`);
          }
          const address = new Address(rest[INDEX.A.street], rest[INDEX.A.city], zip);
          if (this.currentFamilyMember) {
            this.currentFamilyMember.address = address;
          } else {
            this.currentPerson.address = address;
          }
          break;

        case "T":
          if (!this.currentPerson) throw new Error(`'T' line without previous 'P' on line ${lineNumber}: "${line}"`);
          if (rest.length !== 2) throw new Error(`Expected 2 fields for 'T' on line ${lineNumber}: "${line}"`);
          const mobile = rest[INDEX.T.mobile];
          const landline = rest[INDEX.T.landline];
          if (!validatePhoneNumber(mobile)) {
            throw new Error(`Invalid mobile number format on line ${lineNumber}: "${mobile}"`);
          }
          if (!validatePhoneNumber(landline)) {
            throw new Error(`Invalid landline format on line ${lineNumber}: "${landline}"`);
          }
          const phone = new Phone(mobile, landline);
          if (this.currentFamilyMember) {
            this.currentFamilyMember.phone = phone;
          } else {
            this.currentPerson.phone = phone;
          }
          break;

        default:
          throw new Error(`Unknown line type '${type}' on line ${lineNumber}: "${line}"`);
      }

      const allowedAfter = {
        P: ["T", "A", "F"],
        F: ["T", "A"],
        T: ["A", "F", "P"],
        A: ["T", "F", "P"]
      };

      if (lastType && !allowedAfter[lastType].includes(type)) {
        throw new Error(`Invalid line type '${type}' after '${lastType}' on line ${lineNumber}: "${line}"`);
      }

      lastType = type;
    }

    if (this.currentPerson) {
      writePerson(stream, this.currentPerson);
    }

    stream.write(TAGS.rootEnd);
    stream.end();
  }
}

if (require.main === module) {
  const inputFile = "data/input.txt";
  const outputFile = "output-xml/output.xml";

  const converter = new Converter(inputFile, outputFile);
  converter.convert().then(() => {
    console.log(`Converting finished, found in: ${outputFile}`);
  }).catch(err => {
    console.error("Error during converting:", err.message);
  });
}

module.exports = {
  Converter,
};
