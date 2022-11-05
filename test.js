const jikan = require("@mateoaranda/jikanjs");

async function main() {
  let res = await jikan.search("search", "Death Note", 10)
  console.log(res);
}
main();