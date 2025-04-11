async function getAllPages() {
    const baseUrl = "https://www.la-spa.fr/app/wp-json/spa/v1/animals/search/?api=1&seed=1";
    const pageCount = await fetch(baseUrl).then(r => r.json()).then(o => o.nb_pages);
    const results = await fetch(`${baseUrl}&paged=${pageCount}&full=1`).then(r => r.json()).then(o => o.results);
    return results;
  }
  
  getAllPages().then(a => console.log(a.length));