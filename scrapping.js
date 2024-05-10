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



    // number of annimals 
    const strongText = await page.$eval('.c-adoption-results_suptitle strong', element => element.textContent);

    console.log('Strong text:', strongText);



    // Get the link for the annimal 

    const animalLinks = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.href));


    const uniqueAnimalLinks = [...new Set(animalLinks)];



    console.log('Animal links:', uniqueAnimalLinks);


    const url = await page.url();
    console.log('URL:', url);



    await page.waitForSelector('.c-see-more_link');
    await page.click('.c-see-more_link');

    console.log('See more clicked');

    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    const animalLinks2 = await page.$$eval('a[data-animal-id]', elements => elements.map(element => element.href));


    console.log('Animal links:', animalLinks2);







    await page.screenshot({ path: 'screenshot.png' });

    await browser.close();
}

run();