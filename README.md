# SiF Unicode Styler

A browser extension that turns plain text into fancy Unicode styles: bold, italic, script, fraktur, bubble, small caps, upside down and more. Click a style to copy it, then paste it anywhere (Facebook, Instagram, WhatsApp, X, Discord, bios, names).

Works offline. No tracking, no network requests.

- **Version:** 1.2.5
- **Browsers:** Chrome, Edge, Brave, Opera, Samsung Internet (desktop) and Firefox 109+

## Features

- **20+ text styles**: Bold / Italic / Bold Italic (Serif and Sans), Double Struck, Monospace, Script, Fraktur, Circled, Circled Dark, Squared, Fullwidth, Small Caps, Superscript, Subscript, Upside Down
- **Decoration frames**: Stars Sparkle, Magic Glow, Wing Swirl, Heavy Box, Double Bracket, Dotted Crown, Vintage Flower, In Love Heart, Cyber Flash, Shield Frame
- **Diacritic effects**: strikethrough, underline, double underline, "creepy" (Zalgo) text
- **Custom letter spacing** slider
- **Case control**: original, UPPER, lower
- **Category filters** (Serif, Sans, Special) and **style search**
- **Favorites (bookmarks)** and **copy history**, saved locally
- **Three themes**: Dark, Colored, Light

## Installation

### Option 1: Download the ZIP (easiest)

1. Download `sif-unicode-styler-v1.2.5.zip` from the [Releases page](https://github.com/sifatrhmn/sif-unicode-styler/releases/latest) (also in [`release/`](release/)), or use **Code → Download ZIP** for the whole repo.
2. Extract it to a folder you will keep (don't delete it later, or the extension stops working).

### Option 2: Clone

```bash
git clone https://github.com/sifatrhmn/sif-unicode-styler.git
```

The extension files are in the `extension/` folder.

### Chrome / Edge / Brave / Opera

1. Open `chrome://extensions` (Edge: `edge://extensions`).
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the extracted folder (the one that contains `manifest.json`).
5. Pin the extension: click the puzzle icon in the toolbar, then the pin next to **SiF Unicode Styler**.

### Firefox

**Temporary (for testing):**
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**
3. Pick `manifest.json` inside the extension folder.

Firefox removes temporary add-ons when it restarts. For a permanent install, the add-on has to be signed through [addons.mozilla.org](https://addons.mozilla.org/developers/).

## How to use

1. Click the **SiF Unicode** icon in the toolbar.
2. Type your text in the **Type text...** box.
3. All styles update live. To narrow the list:
   - Pick a category: **All / Serif / Sans / Spec**
   - Or type in **Search styles...**
4. Optional tweaks:
   - **Frame**: pick a decoration preset to wrap the text
   - **Diacritics**: None, Strk (strikethrough), Undr (underline), Dbl (double underline), Zalg (creepy)
   - **Spacing**: drag the slider to add space between letters
   - **Case**: Orig, UP, lo
5. **Click a style** to copy it. A toast confirms the copy.
6. Paste it wherever you want.
7. Star a style to add it to **Favorites**. Copied results show up in **History**. Use **Clear** to empty either list.
8. Switch the theme with the Dark / Colored / Light buttons.

> Tip: some apps or fonts can't display every Unicode character. If a style shows as boxes (□), try a different one.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Saves your favorites, history and theme on your device |
| `clipboardWrite` | Copies the styled text when you click it |

Nothing is sent anywhere. All data stays in your browser.

## Project structure

```
extension/
  manifest.json   Extension manifest (MV3, Chrome + Firefox)
  popup.html      Popup UI
  popup.js        Style maps and logic
  icon.png        Toolbar icon
release/
  sif-unicode-styler-v1.2.5.zip   Ready-to-load package
```

## Author

Made by Dr Sifat.

## License

[MIT](LICENSE)
