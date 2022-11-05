import CryptoJS from "crypto-js";
import axios from "axios";

const key = CryptoJS.enc.Utf8.parse("37911490979715163134003223491201");
const second_key = CryptoJS.enc.Utf8.parse("54674138327930866480207815084989");
const iv = CryptoJS.enc.Utf8.parse("3134003223491201");

export const getAjaxParams = async ($, id) => {
  const encryptedKey = CryptoJS.AES["encrypt"](id, key, { iv: iv });
  const script = $("script[data-name='episode']").data().value;
  const token = CryptoJS.AES["decrypt"](script, key, { iv: iv }).toString(
    CryptoJS.enc.Utf8
  );

  return `id=${encryptedKey}&alias=${id}&${token}`;
};

export const decryptAjaxResponse = async (fetchedRes) => {
  const decryptedString = CryptoJS.enc.Utf8.stringify(
    CryptoJS.AES.decrypt(fetchedRes.data, second_key, { iv: iv })
  );

  return JSON.parse(decryptedString);
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
const headerOption = { headers: { "User-Agent": USER_AGENT } };

const decodeString = (string) => {
  return Buffer.from(string, "base64").toString();
};

export const encodeString = (string) => {
  return Buffer.from(string).toString("base64");
};

export const decodeStreamingLinkAnimix = async (animixLiveApiLink) => {
  let plyrLink;

  const animixLiveApiRegex = new RegExp(/(aHR0[^#]+)/);
  console.log({ animixLiveApiLink });
  if (animixLiveApiLink.includes("player.html")) {
    plyrLink = animixLiveApiLink;
  } else {
    const res = await axios.get(animixLiveApiLink, headerOption);
    plyrLink = await res.request.res.responseUrl;
  }

  const sourceLink = decodeString((animixLiveApiRegex.exec(plyrLink) ?? [''])[0]);

  return sourceLink;
};

export const firstLetterToUpperCase = (str) => {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
};
