import type { Anime } from "@prisma/client";
import { showSettings } from "./stores";
import { browser } from "$app/environment";

export const isElectron = browser
  ? navigator.userAgent.toLowerCase().includes(" electron/")
  : false;

export const isDev = process.env.NODE_ENV != "production";

export const serverOrigin = isDev
  ? "http://localhost:5000"
  : "https://api.animos.cf";

export function getColorType(color: string) {
  const c = color.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  if (luma < 40) {
    return "dark";
  } else {
    return "light";
  }
}

function hexToRgb(hex: string) {
  hex = hex.replace("#", "");
  const aRgbHex = hex.match(/.{1,2}/g);
  if (aRgbHex == null) return;
  const aRgb = [
    parseInt(aRgbHex[0], 16),
    parseInt(aRgbHex[1], 16),
    parseInt(aRgbHex[2], 16),
  ];
  return {
    red: aRgb[0],
    green: aRgb[1],
    blue: aRgb[2],
  };
}

export function lightOrDark(colorHex: string) {
  const { red, green, blue } = hexToRgb(colorHex) ?? {
    red: 0,
    green: 0,
    blue: 0,
  };
  const hsp = red * 0.299 + green * 0.587 + blue * 0.114;
  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 150) {
    return "light";
  } else {
    return "dark";
  }
}

const genreColors = ["#742802", "#c14a09", "#b0306a", "#985538", "#35654d"];

export function getGenreColor(name: string) {
  const index = (name.length + name.charCodeAt(1)) % genreColors.length;
  return genreColors[index];
}

export function getTitle(anime: Anime): string {
  return (anime.title_en || anime.title || anime.title_jp) ?? "";
}

export function capitalize(word: string) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export function getNumberOfLines(elementId: string) {
  const element = document.getElementById(elementId);
  if (element == null) return 0;
  const lineHeight = getComputedStyle(element).getPropertyValue("line-height");
  const elementHeight = element.clientHeight;
  return Math.floor(elementHeight / parseInt(lineHeight));
}

export function convertRemToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${secs < 10 ? 0 : ""}${secs}`;
}

export function addShortcut(key: string, cb: () => void) {
  document.addEventListener("keypress", (ev) => {
    if (ev.key == key) cb();
  });
}

export function addKeyBoardShortcuts() {
  let settings = false;
  showSettings.subscribe((val) => (settings = val));
  document.onkeydown = (ev) => {
    if (ev.altKey) {
      // Alt Key combinations
      switch (ev.key) {
        case "ArrowLeft":
          history.back();
          break;
        case "ArrowRight":
          history.forward();
          break;
        case "s":
          showSettings.set(!settings);
          break;
      }
    } else if (ev.key == "/") {
      document.getElementById("search-input")?.focus();
      ev.preventDefault();
    }
  };
}

export function replaceStateWithQuery(values: Record<string, string>) {
  const url = new URL(window.location.toString());
  for (const [key, val] of Object.entries(values)) {
    if (val) {
      url.searchParams.set(encodeURIComponent(key), encodeURIComponent(val));
    } else {
      url.searchParams.delete(key);
    }
  }
  history.replaceState({}, "", url);
}
