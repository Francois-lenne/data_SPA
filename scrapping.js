const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
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


        await page.screenshot({ path: `screenshot_${counter}.png` });

        console.log(animalLinks);
        console.log('Number of animal links:', animalLinks.length);

        const uniqueAnimalLinks = [...new Set(animalLinks)];

        fs.writeFileSync(`links${counter}.json`, JSON.stringify(uniqueAnimalLinks, null, 2));
    }

    await browser.close();
}

run();