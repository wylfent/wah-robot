const puppeteer = require('puppeteer')
const { WAH_URL } = require('./constants')
const { loadProfile, parseArgument, sleep } = require('./utils')
const { autoFillWahForm, isStart } = require('./wah')



async function openForm(profile) {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
        args: [
            `--window-size=${profile.width},${profile.height}`,
            `--window-position=${profile.x},${profile.y}`
        ]
    })
    const pages = await browser.pages()
    const page = pages[0]
    while (true) {
        try {
            const pageloadPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            await page.goto(WAH_URL)
            await pageloadPromise

            await page.waitForSelector('#btLogin', { timeout: 200 }) // will throw if no submit button - which it hasn't yet 9AM
            break
        } catch (error) {
            console.warn('Failed to open form - Keep retrying')
            await sleep()
        }
    }
    const no = await getRegisteredNo(page)
    console.log('Opened form -', no)
    return page
}

async function getRegisteredNo(page) {
    const noElement = await page.$('[name="frLogin"] table tbody tr:nth-child(2) font:nth-child(1)')
    const noHandle = await noElement.getProperty('textContent')
    return noHandle.toString()
}

async function fillRegisterForm(page, info) {
    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('[name="fileUpload"')
    ])
    await fileChooser.accept([info.imagePath])
    page.evaluate(autoFillWahForm, info)
    console.log('Filled form')
}

async function submitForm(page) {
    console.log('Submitting form')
    page.click('[name="btLogin"]')
    let responseMessage = ''
    page.once('dialog', dialog => {
        const message = dialog.message()
        console.log('Get dialog -', message)
        responseMessage = message
    })
    let attempt = 0
    while (true) {
        attempt++
        try {
            await page.waitForNavigation({ waitUntil: 'networkidle0' })
            await page.waitForSelector('#btLogin', { timeout: 200 }) // will throw if no submit button - which it hasn't yet 9AM
            break
        } catch (error) {
            if (responseMessage) {
                console.log(`Already submitted - ${responseMessage}`)
                break
            }
            console.error('Error while submitting form', error.message)
            console.error(`Resubmitting - attempt: ${attempt}`)
            page.evaluate(() => window.reloadButtonClick())
        }
    }
}

async function run() {
    const { profilePath, isTest } = parseArgument()
    const profile = loadProfile(profilePath)
    while (!isStart()) {
        await sleep(5_000)
        const now = new Date().toISOString()
        console.log('Waiting.. -', now)
    }
    console.log('Running..')
    const page = await openForm(profile)
    await fillRegisterForm(page, profile)
    if (!isTest) {
        await submitForm(page)
    }
}

run()