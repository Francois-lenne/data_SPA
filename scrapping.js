const puppeteer = require('puppeteer');
const fs = require('fs');
const parquet = require('parquetjs');

console.log('Parquet:');


// Define the schema of the Parquet file

let schema = new parquet.ParquetSchema({
  'ID': { type: 'INT64' },
  'RACE': { type: 'UTF8' },
  'NAMES': { type: 'UTF8' },
  'SEX': { type: 'UTF8' },
  'AGE': { type: 'UTF8' },
  'SOS': { type: 'UTF8' },
  'SPECIES': { type: 'UTF8' },
  'IMAGE_LINKS': { type: 'UTF8' },
  'ETABLISHMENTS': { type: 'UTF8' },
  'DATE': { type: 'UTF8' },
});

async function run() {

    // create the parquet file 


    const date_jour = new Date().toISOString().slice(0, 10);
    let fileName = `animals_${date_jour}.parquet`;

    let writer = await parquet.ParquetWriter.openFile(schema, fileName);


    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://www.la-spa.fr/adoption/');

    console.log('Page loaded');
    
    // Accept cookies
    await page.waitForSelector('#gdpr-accept');
    await page.click('#gdpr-accept'); // Using the ID of the "Accept cookies" button

    console.log('Cookies accepted');

    // Scroll down
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
    }

    console.log('Scrolled down');

    // number of animals 
    let seeMoreActive = true;
    let animalLinks = [];
    let counter = 0;

    while (seeMoreActive) {
        // Try to click on the "Voir plus" button

        counter++;
        try {
            await page.waitForSelector('.c-see-more_link', { timeout: 5000 });
            await page.click('.c-see-more_link');

            // Wait for the new content to load
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        } catch (error) {
            // If the "Voir plus" button is not found, it means it's not active
            seeMoreActive = false;
        }

        // Get the href of all <a> elements with a data-animal-id attribute
        const newAnimalLinks = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.href));
        animalLinks = [...animalLinks, ...newAnimalLinks];




        // get the id of the animals 
        const animalIds = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-id')));

        console.log('Animal IDs:', animalIds);

        // get the especes of the animals

        const animalRaces = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-race')));

        console.log('Animal Race', animalRaces);



        // get the names of the animals

        const animalNames = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-nom')));


        console.log('Animal Names', animalNames);


        // get the gender of the animals

        const animalGenders = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-gender')));

        console.log('Animal Sex', animalGenders);


        // get the age of the animals

        const animalAges = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-age')));

        console.log('Animal Age', animalAges);


        // get the SOS of the animals 

        const animalSos = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-sos')));

        console.log('Animal SOS', animalSos);




        // get the spacies of the animals

        const animalSpecies = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-espece')));

        console.log('Animal Species', animalSpecies);



        // get the image of the animals


        const animalImageLinks = await page.$$eval('a[data-animal-id] img', elements => elements.map(element => element.getAttribute('src')));

        console.log('Animal Image Links', animalImageLinks);


        // get the establishments of the animals 
        

        const animalEstablishments = await page.$$eval('a.f-miniAnimals_establishment span', elements => elements.map(element => element.textContent));

        console.log('Animal Establishments', animalEstablishments);

        // Take a screenshot


        await page.screenshot({ path: `screenshot_${counter}.png` });

        console.log('Number of animal links:', animalLinks.length);

        const uniqueAnimalLinks = [...new Set(animalLinks)];

        fs.writeFileSync(`links$n{counter}.json`, JSON.stringify(uniqueAnimalLinks, null, 2));
    }

    await browser.close();
}

run();