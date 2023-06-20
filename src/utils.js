const fs = require('fs')

function loadProfile(profilePath) {
    if (!profilePath) {
        throw new Error('profile not found')
    }
    const profileTxt = fs.readFileSync(profilePath).toString()
    return JSON.parse(profileTxt)
}

function parseArgument() {
    const [_, __, profilePath, testFlag] = process.argv
    return {
        profilePath,
        isTest: testFlag === 'true'
    }
}

function sleep(timeout) {
    if (timeout === undefined) {
        timeout = 1_000 + Math.random() * 1_000 // ~ 1-2 seconds
    }
    return new Promise((res) => {
        setTimeout(() => res(), timeout)
    })
}

module.exports = {
    loadProfile,
    parseArgument,
    sleep,
}