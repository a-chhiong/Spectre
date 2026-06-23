const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
    'https://dbdocs.io/Holistics/Ecommerce?table=users&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=order_items&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=orders&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=order_item_variants&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=merchants&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=shipping_carriers&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=payment_transactions&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=promotions&schema=core&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=countries&schema=info&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=products&schema=product&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=categories&schema=product&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=product_variants&schema=product&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=product_tags&schema=product&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=product_tags_map&schema=product&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=cart_items&schema=cart&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=reviews&schema=review&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=wishlists&schema=wishlist&view=table_structure',
    'https://dbdocs.io/Holistics/Ecommerce?table=wishlist_items&schema=wishlist&view=table_structure'
];

async function main() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    let dbml_output = '';
    let extractedData = {};

    for (const url of urls) {
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Wait for the table element to appear
        try {
            await page.waitForSelector('table', { timeout: 10000 });
        } catch(e) {
            console.log(`Timeout waiting for table on ${url}`);
            continue;
        }

        const urlParams = new URLSearchParams(new URL(url).search);
        const tableName = urlParams.get('table');
        const schemaName = urlParams.get('schema');

        console.log(`Extracting ${schemaName}.${tableName}...`);

        // Extract the table structure
        // Looking at typical dbdocs, the data table has columns: Name, Type, Settings, References, Note
        const tableData = await page.evaluate(() => {
            let trs = Array.from(document.querySelectorAll('table tbody tr'));
            let columns = [];
            for (let tr of trs) {
                let tds = Array.from(tr.querySelectorAll('td'));
                if (tds.length >= 5) { // Assuming 5 columns standard
                    let name = tds[0].innerText.trim();
                    let type = tds[1].innerText.trim();
                    let settings = tds[2].innerText.trim();
                    let refs = tds[3].innerText.trim();
                    let note = tds[4].innerText.trim();
                    
                    // some dbdocs layouts might differ, let's just grab all td texts
                    columns.push({
                        name, type, settings, refs, note,
                        raw: tds.map(td => td.innerText.trim())
                    });
                } else {
                    columns.push({
                        raw: tds.map(td => td.innerText.trim())
                    });
                }
            }
            
            // Extract table-level note if exists (usually above the table or somewhere)
            let tableNote = '';
            // Just grab all texts that look like descriptions
            let potentialNotes = Array.from(document.querySelectorAll('p, .note, .description')).map(el => el.innerText.trim());
            return { columns, potentialNotes };
        });

        extractedData[`${schemaName}.${tableName}`] = tableData;
        
        let block = `Table ${schemaName}.${tableName} {\n`;
        for (let col of tableData.columns) {
            if (col.name) {
                let colStr = `  ${col.name} ${col.type}`;
                let attrs = [];
                if (col.settings && col.settings !== '-') {
                    attrs.push(col.settings.split(',').map(s => s.trim()).join(', '));
                }
                if (col.note && col.note !== '-' && col.note !== '') {
                    // escape quotes
                    let safeNote = col.note.replace(/"/g, '\\"');
                    attrs.push(`note: "${safeNote}"`);
                }
                if (attrs.length > 0) {
                    colStr += ` [${attrs.join(', ')}]`;
                }
                block += colStr + `\n`;
            } else if (col.raw && col.raw.length > 0) {
                 block += `  // raw: ${col.raw.join(' | ')}\n`;
            }
        }
        
        // Add potential notes as comments
        if (tableData.potentialNotes && tableData.potentialNotes.length > 0) {
            let uniqueNotes = [...new Set(tableData.potentialNotes)].filter(n => n.length > 10 && !n.includes('Sign in') && !n.includes('dbdocs.io'));
            if (uniqueNotes.length > 0) {
                block += `\n  Note: '''\n`;
                for (let n of uniqueNotes) {
                    block += `  ${n}\n`;
                }
                block += `  '''\n`;
            }
        }
        
        block += `}\n\n`;
        dbml_output += block;
    }

    fs.writeFileSync('output/scraped_ecommerce.dbml', dbml_output);
    fs.writeFileSync('output/scraped_data.json', JSON.stringify(extractedData, null, 2));
    
    await browser.close();
    console.log("Done scraping!");
}

main().catch(console.error);
