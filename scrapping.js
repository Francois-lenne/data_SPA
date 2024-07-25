const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://www.la-spa.fr/adoption/');

    console.log('Page loaded');
    
    // Accept cookies
    await page.waitForSelector('#gdpr-accept');
    await page.click('#gdpr-accept');

    console.log('Cookies accepted');

    // Scroll down
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('Scrolled down');

    let seeMoreActive = true;
    let animalData = [];
    let processedIds = new Set();
    let counter = 0;

    while (seeMoreActive) {
        counter++;
        try {
            await page.waitForSelector('.c-see-more_link', { timeout: 5000 });
            await page.click('.c-see-more_link');
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            seeMoreActive = false;
        }

        // Get new animal data
        const newAnimalIds = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-id')));
        const newAnimalLinks = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.href));
        const newAnimalRaces = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-race')));
        const newAnimalNames = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-nom')));
        const newAnimalGenders = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-gender')));
        const newAnimalAges = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-age')));
        const newAnimalSos = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-sos')));
        const newAnimalSpecies = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.getAttribute('data-animal-espece')));
        const newAnimalEstablishments = await page.$$eval('a.f-miniAnimals_establishment span', elements => elements.map(element => element.textContent));

        console.log(`Iteration ${counter}:`);
        console.log('New Animal IDs:', newAnimalIds);
        console.log('New Animal Links:', newAnimalLinks);
        console.log('New Animal Races:', newAnimalRaces);
        console.log('New Animal Names:', newAnimalNames);
        console.log('New Animal Genders:', newAnimalGenders);
        console.log('New Animal Ages:', newAnimalAges);
        console.log('New Animal SOS:', newAnimalSos);
        console.log('New Animal Species:', newAnimalSpecies);
        console.log('New Animal Establishments:', newAnimalEstablishments);

        // Process new animals
        for (let i = 0; i < newAnimalIds.length; i++) {
            if (!processedIds.has(newAnimalIds[i])) {
                processedIds.add(newAnimalIds[i]);
                animalData.push({
                    id: newAnimalIds[i],
                    link: newAnimalLinks[i],
                    race: newAnimalRaces[i],
                    age: newAnimalAges[i],
                    sos: newAnimalSos[i],
                    genders: newAnimalGenders[i],
                    species: newAnimalSpecies[i],
                    name: newAnimalNames[i],
                    establishment: newAnimalEstablishments[i]
                });
            }
        }

    }

    console.log('Scraping finished');
    const timestamp = new Date().getTime();
    fs.writeFileSync(`animal_data_${timestamp}.json`, JSON.stringify(animalData, null, 2));

    await browser.close();
}

run();