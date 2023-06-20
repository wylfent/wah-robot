// autofill by evaluate function in page context
// to prevent weird character when type with puppeteer
function autoFillWahForm({
    id,
    prefixTh,
    nameTh,
    lastnameTh,
    prefixEn,
    nameEn,
    lastnameEn,
    email,
    address,
}) {
    // setup function
    function fillByName(name, value) {
        document.querySelector(`[name="${name}"]`).value = value
    }

    function fillCaptcha() {
        const captcha = document.getElementById('grad1').innerHTML.trim()
        fillByName('capt', captcha)
    }

    function checkConfirm() {
        var isChecked = document.getElementsByName('ckAccept')[0].checked
        if (!isChecked) {
            document.getElementsByName('ckAccept')[0].click()
        }
    }

    // Fill Form
    fillByName('CARD_ID', id)
    fillByName('PREFIX_TH', prefixTh)
    fillByName('NAME_TH', nameTh)
    fillByName('LASTNAME_TH', lastnameTh)
    fillByName('PREFIX_EN', prefixEn)
    fillByName('NAME_EN', nameEn)
    fillByName('LASTNAME_EN', lastnameEn)
    fillByName('EMAIL', email)
    fillByName('ADDRESS', address)

    fillCaptcha()
    checkConfirm()
}

// is start check if it already 8.59AM?
function isStart() {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    return hours > 8 || (hours === 8 && minutes >= 59)
}

module.exports = {
    autoFillWahForm,
    isStart,
}