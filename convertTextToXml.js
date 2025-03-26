const fs = require("fs");

function xmlStructureBuilder(inputFile, outputFile) {
    const data = fs.readFileSync(inputFile, "utf8").trim().split("\n");

    const xml = ['<?xml version="1.0" encoding="UTF-8"?>\n<buildings>\n'];
    let openBuilding = false;
    let openOwner = false;
    let openCompany = false;

    for (const line of data) {
        const parts = line.split("|").map(part => part.trim());
        const type = parts[0];

        switch (type) {
            case "B":
                if (openOwner) {
                    xml.push("\t\t</owner>\n");
                    openOwner = false;
                }

                if (openCompany) {
                    xml.push("\t\t</company>\n");
                    openCompany = false;
                }

                if (openBuilding) {
                    xml.push("\t</building>\n");
                }

                xml.push(`\t<building>\n\t\t<name>${parts[1]}</name>\n`);
                openBuilding = true;
                break;

            case "A":
                const street = parts[1] || "";
                const city = parts[2] || "";
                const zipcode = parts[3] || "";
            
                let address = `\t\t<address>\n\t\t\t<street>${street}</street>\n\t\t\t<city>${city}</city>\n`;
                address += zipcode ? `\t\t\t<zipcode>${zipcode}</zipcode>\n` : `\t\t\t<zipcode />\n`;

                address += `\t\t</address>\n`;
            
                if (openOwner || openCompany) {
                    address = address.replace(/\t\t/g, "\t\t\t");
                }
            
                xml.push(address);
                break;

            case "O":
                if (openOwner) {
                    xml.push("\t\t</owner>\n");
                } 

                if (openCompany) {
                    xml.push("\t\t</company>\n");
                    openCompany = false;
                }

                xml.push(`\t\t<owner>\n\t\t\t<name>${parts[1]}</name>\n`);
                openOwner = true;
                break;

            case "C":
                if (openOwner) {
                    xml.push("\t\t</owner>\n");
                    openOwner = false;
                }

                if (openCompany) {
                    xml.push("\t\t</company>\n");
                }
            
                const companyType = parts[2] || null;
            
                xml.push(`\t\t<company>\n\t\t\t<name>${parts[1]}</name>\n`);
                if (companyType) {
                    xml.push(`\t\t\t<type>${companyType}</type>\n`);
                }
            
                openCompany = true;
                break;

            case "T":
                const landline = parts[1] || null;
                const fax = parts[2] || null;

                xml.push(`\t\t\t<phone>\n`);

                if (landline) {
                    xml.push(`\t\t\t\t<landline>${landline}</landline>\n`);
                }

                if (fax) {
                    xml.push(`\t\t\t\t<fax>${fax}</fax>\n`);
                }

                xml.push(`\t\t\t</phone>\n`);
                break;
        }
    }

    if (openOwner) {
        xml.push("\t\t</owner>\n");
    }

    if (openCompany) {
        xml.push("\t\t</company>\n");
    }

    if (openBuilding) {
        xml.push("\t</building>\n");
    }
    
    if (xml.length > 0) {
        xml.push("</buildings>\n");
    }

    fs.writeFileSync(outputFile, xml.join(""), "utf8");
}

xmlStructureBuilder("input.txt", "structured.xml");
