const puppeteer = require('puppeteer'); // controls headless browser
const cheerio = require('cheerio');
const url = 'https://www.rbc.ru/';

puppeteer
  .launch()
  .then(function (browser) {
    return browser.newPage();
  })
  .then(function (page) {
    return page.goto(url).then(function () {
      return page.content(); // получаем содержимое страницы в html
    });
  })
  .then(function (html) {
    let $ = cheerio.load(html, {
      // загружаем html в cheerio
      xml: {
        normalizeWhitespace: true,
      },
    });
    console.log('-----');

    // РАБОТАЕТ

    // let news1 = $('.main__big__title').toArray();
    // news1.forEach((el) => {
    //   console.log($(el).text());
    // });
    // let news2 = $('.main__feed__title').toArray();
    // news2.forEach((el) => {
    //   console.log($(el).text());
    // });
    // let news3 = $('.news-feed__item__title').toArray();
    // news3.forEach((el) => {
    //   let header = $(el).text().toString().trim();
    //   if (header.indexOf('&nbsp;') !== -1) {
    //     header = header.split('&nbsp;').join(' ');
    //   }
    //   console.log(header);
    // });

    // news1.concat(news2, news3);  // НЕПОНЯТНО ПОЧЕМУ НЕ РАБОТАЕТ
    // news1.forEach((el) => {      // экземпляры класса в массиве
    //   console.log($(el).text());
    // });

    // - НЕ РАБОТАЕТ

    let news4 = $('.item__title .rm-cm-item-text').toArray();
    news4.forEach((el) => {
      console.log($(el).text());
    });
    // let news5 = $('.item__title-wrap').toArray();
    // news5.forEach((el) => {
    //   console.log($(el));
    // });

    return false;
  })
  .catch(function (err) {
    // handle error
  });
