const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const cron = require('node-cron')
const dotenv = require('dotenv')
dotenv.config()

async function start() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(process.env.WEB_URL)
  // await page.screenshot({ path: 'amazing.png' })

  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.info strong')).map(
      (x) => x.textContent
    )
  })
  // const names = ['red', 'orange', 'yellow']
  await fs.writeFile('names.txt', names.join('\r\n'))

  await page.click('#clickme')
  const clickedData = await page.$eval('#data', (el) => el.textContent)
  console.log(clickedData)

  const photos = await page.$$eval('img', (imgs) => {
    return imgs.map((x) => x.src)
  })

  await page.type('#ourfield', 'blue')
  await Promise.all([page.click('#ourform button'), page.waitForNavigation()])
  const info = await page.$eval('#message', (el) => el.textContent)
  console.log(info)

  for (const photo of photos) {
    const imagePage = await page.goto(photo)
    await fs.writeFile(photo.split('/').pop(), await imagePage.buffer())
  }

  await browser.close()
}

cron.schedule('*/5 * * * * *', start)
