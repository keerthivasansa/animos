export function getColorType(color:string) {
    let c = color.substring(1);
    let rgb = parseInt(c, 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;
    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
    if (luma < 40) {
      return "dark";
    } else {
      return "light";
    }
  }

  function hexToRgb(hex:string) {
    let aRgbHex = hex.match(/.{1,2}/g);
    if  (!aRgbHex)
        return;
    if (aRgbHex[0].trim() == '#')
        aRgbHex.splice(0, 1);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return {
      red: aRgb[0],
      green: aRgb[1],
      blue: aRgb[2]
    };
  }
  
export function getAccentClrType() {
    let accentClr = getComputedStyle(document.body).getPropertyValue("--accent-color");
    return lightOrDark(accentClr);
}

export function lightOrDark(colorHex: string) {
    let { red, green, blue } = hexToRgb(colorHex) ?? { red: 0, green: 0, blue: 0};
    let hsp = red*0.299 + green*0.587 + blue*0.114;
    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 186) {
      return "light";
    } else {
      return "dark";
    }
}
