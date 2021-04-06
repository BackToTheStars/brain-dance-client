// Получить объект вида
let newsPiece = {
  date: '',
  imageUrls: [],
  header1: '',
  header2: '',
  text: [],
};

const puppeteer = require('puppeteer'); // controls headless browser
const cheerio = require('cheerio');
const url =
  'https://www.rbc.ru/society/29/03/2021/606226619a7947462dfb1c50?from=from_main_6';

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

    //let newsDate = $('.article__header__date').toArray();
    let stringDate = $('.article__header__date').toArray();
    let newsDate = Date.parse($(stringDate[0]).text());
    console.log(newsDate);

    // newsDate.forEach((el) => {
    //   console.log($(el).text());
    // });

    // let news1 = $('.main__big__title').toArray();
    // news1.forEach((el) => {
    //   console.log($(el).text());
    // });

    // let news3 = $('.news-feed__item__title').toArray();
    // news3.forEach((el) => {
    //   let header = $(el).text().toString().trim();
    //   if (header.indexOf('&nbsp;') !== -1) {
    //     header = header.split('&nbsp;').join(' ');
    //   }
    //   console.log(header);
  })
  .catch(function (err) {
    console.log(err);
  });
