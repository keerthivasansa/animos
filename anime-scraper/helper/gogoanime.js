const CryptoJS = require('crypto-js')

const key = CryptoJS.enc.Utf8.parse('37911490979715163134003223491201')
const second_key = CryptoJS.enc.Utf8.parse('54674138327930866480207815084989')
const iv = CryptoJS.enc.Utf8.parse('3134003223491201')

const getAjaxParams = async ($, id) => {
  const encryptedKey = CryptoJS.AES['encrypt'](id, key, { iv: iv })
  const script = $("script[data-name='episode']").data().value
  const token = CryptoJS.AES['decrypt'](script, key, { iv: iv }).toString(
    CryptoJS.enc.Utf8,
  )

  return `id=${encryptedKey}&alias=${id}&${token}`
}

const decryptAjaxResponse = async (fetchedRes) => {
  const decryptedString = CryptoJS.enc.Utf8.stringify(
    CryptoJS.AES.decrypt(fetchedRes.data, second_key, { iv: iv }),
  )

  return JSON.parse(decryptedString)
}

module.exports = { decryptAjaxResponse, getAjaxParams }
