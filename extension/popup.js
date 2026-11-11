// Extension State management
const state = {
  inputText: "SiF Unicode Text",
  searchQuery: "",
  selectedCategory: "All",
  selectedDeco: 0,
  selectedDiacritic: "",
  letterSpacing: 0,
  textCase: "normal",
  favorites: [],
  history: []
};

// LocalStorage helpers adapted for extension scope
function loadStorage() {
  try {
    const favs = localStorage.getItem("sif_favorites");
    if (favs) state.favorites = JSON.parse(favs);
    
    const hist = localStorage.getItem("sif_copy_history");
    if (hist) state.history = JSON.parse(hist);

    const theme = localStorage.getItem("sif_theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButtons(theme);
  } catch (e) {
    console.error("Local storage error", e);
  }
}

function saveFavorites() {
  localStorage.setItem("sif_favorites", JSON.stringify(state.favorites));
  updateSidebarFavorites();
}

function saveHistory() {
  localStorage.setItem("sif_copy_history", JSON.stringify(state.history));
  updateSidebarHistory();
}

function updateThemeButtons(theme) {
  document.querySelectorAll(".theme-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`theme-btn-${theme}`).classList.add("active");
}

let toastTimeout;
function triggerToast(message) {
  const toast = document.getElementById("toast-notif-element");
  const label = document.getElementById("toast-msg-label");
  label.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Small Caps lookup
const smallCapsMap = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ",
  g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ",
  m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "q", r: "ʀ",
  s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
  y: "ʏ", z: "ᴢ",
  A: "ᴀ", B: "ʙ", C: "ᴄ", D: "ᴅ", E: "ᴇ", F: "ꜰ",
  G: "ɢ", H: "ʜ", I: "ɪ", J: "ᴊ", K: "ᴋ", L: "ʟ",
  M: "ᴍ", N: "ɴ", O: "ᴏ", P: "ᴘ", Q: "q", R: "ʀ",
  S: "ꜱ", T: "ᴛ", U: "ᴜ", V: "ᴠ", W: "ᴡ", X: "x",
  Y: "ʏ", Z: "ᴢ"
};

// Superscript lookup
const superscriptCapMap = {
  A: "ᴬ", B: "ᴮ", C: "ᶜ", D: "ᴰ", E: "ᴱ", F: "ᶠ",
  G: "ᴳ", H: "ᴴ", I: "ᴵ", J: "ᴶ", K: "ᴷ", L: "ᴸ",
  M: "ᴹ", N: "ᴺ", O: "ᴼ", P: "ᴾ", Q: "ᵠ", R: "ᴿ",
  S: "ˢ", T: "ᵀ", U: "ᵁ", V: "ⱽ", W: "ᵂ", X: "ˣ",
  Y: "ʸ", Z: "ᶻ"
};

const superscriptLowerMap = {
  a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ",
  g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ",
  m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ", q: "ᵠ", r: "ʳ",
  s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ",
  y: "ʸ", z: "ᶻ"
};

const superscriptDigits = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³",
  "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷",
  "8": "⁸", "9": "⁹"
};

// Subscript lookup
const subscriptLowerMap = {
  a: "ₐ", b: "b", c: "c", d: "d", e: "ₑ", f: "f", g: "g", h: "ₕ",
  i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ",
  o: "ₒ", p: "ₚ", q: "q", r: "ᵣ", s: "ₛ", t: "ₜ",
  u: "ᵤ", v: "ᵥ", w: "w", x: "ₓ", y: "y", z: "z",
  A: "ₐ", B: "b", C: "c", D: "d", E: "ₑ", F: "f", G: "g", H: "ₕ",
  I: "ᵢ", J: "ⱼ", K: "ₖ", L: "ₗ", M: "ₘ", N: "ₙ",
  O: "ₒ", P: "ₚ", Q: "q", R: "ᵣ", S: "ₛ", T: "ₜ",
  U: "ᵤ", V: "ᵥ", W: "w", X: "ₓ", Y: "y", Z: "z"
};

const subscriptDigits = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
};

// Upside Down Map
const upsideDownMap = {
  A: "∀", B: "ᗺ", C: "Ɔ", D: "D", E: "Ǝ", F: "Ⅎ",
  G: "פ", H: "H", I: "I", J: "ſ", K: "K", L: "˥", M: "W",
  N: "N", O: "O", P: "Ԁ", Q: "Ό", R: "ᴚ", S: "S", T: "⊥",
  U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ",
  g: "ƃ", h: "ɥ", i: "ı", j: "ɾ", k: "ʞ", l: "l",
  m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s",
  t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  "0": "0", "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ᔭ",
  "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6"
};

const DECO_PRESETS = [
  { name: "None", prefix: "", suffix: "" },
  { name: "Stars Sparkle", prefix: "✦ ", suffix: " ✦" },
  { name: "Magic Glow", prefix: "✨ ", suffix: " ✨" },
  { name: "Wing Swirl", prefix: "★彡 ", suffix: " 彡★" },
  { name: "Heavy Box", prefix: "【 ", suffix: " 】" },
  { name: "Double Bracket", prefix: "『 ", suffix: " 』" },
  { name: "Dotted Crown", prefix: "✧ ", suffix: " ✧" },
  { name: "Vintage Flower", prefix: "✿ ", suffix: " ✿" },
  { name: "In Love Heart", prefix: "♥ ", suffix: " ♥" },
  { name: "Cyber Flash", prefix: "⚡ ", suffix: " ⚡" },
  { name: "Shield Frame", prefix: "⟨ ", suffix: " ⟩" }
];

const UNICODE_STYLES = [
  {
    id: "serif-bold",
    name: "Bold (Serif)",
    description: "𝐂𝐥𝐚𝐬𝐬𝐢𝐜𝐚𝐥 𝐒𝐞𝐫𝐢𝐟 𝐄𝐦𝐩𝐡𝐚𝐬𝐢𝐬",
    category: "Serif",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119743);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119737);
        if (code >= 48 && code <= 57) return String.fromCodePoint(code + 120734);
        return char;
      }).join("");
    }
  },
  {
    id: "serif-italic",
    name: "Italic (Serif)",
    description: "优雅衬线斜体 (Elegant slant)",
    category: "Serif",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code === 104) return "ℎ";
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119795);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119789);
        return char;
      }).join("");
    }
  },
  {
    id: "serif-bold-italic",
    name: "Bold Italic (Serif)",
    description: "𝑷𝒐𝒘𝒆𝒓𝒇𝒖𝒍 𝑬𝒍𝒆𝒈𝒂𝒏𝒕 𝑴𝒊𝒙",
    category: "Serif",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119847);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119841);
        if (code >= 48 && code <= 57) return String.fromCodePoint(code + 120734);
        return char;
      }).join("");
    }
  },
  {
    id: "sans-bold",
    name: "Bold (Sans)",
    description: "𝗠𝗼𝗱𝗲𝗿𝗻 𝗦𝗹𝗲𝗲𝗸 𝗘𝗺𝗽𝗵𝗮𝘀𝐢𝐬",
    category: "Sans",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120211);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120203);
        if (code >= 48 && code <= 57) return String.fromCodePoint(code + 120764);
        return char;
      }).join("");
    }
  },
  {
    id: "sans-italic",
    name: "Italic (Sans)",
    description: "𝘔𝒐𝒅𝒆𝒓𝒏 𝘚𝘭𝘢𝘯𝒕𝒆𝘥 𝘍𝘭𝒐𝕨",
    category: "Sans",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120263);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120255);
        return char;
      }).join("");
    }
  },
  {
    id: "sans-bold-italic",
    name: "Bold Italic (Sans)",
    description: "𝙈𝒐𝙙𝙚𝙧𝙣 𝙎𝙩𝙧𝙞𝙠𝙞𝙣𝗴 𝙋𝙪𝙣𝙘𝙝",
    category: "Sans",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120315);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120309);
        if (code >= 48 && code <= 57) return String.fromCodePoint(code + 120764);
        return char;
      }).join("");
    }
  },
  {
    id: "double-struck",
    name: "Double Struck (Outline)",
    description: "𝔹𝕠𝕝𝕕 𝕄𝕒𝕥𝕙𝕖𝕞𝕒𝕥𝕚𝕔𝕒𝕝 𝕆𝕦𝕥𝕝𝕚𝕟𝕖",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code === 67) return "ℂ";
        if (code === 72) return "ℍ";
        if (code === 78) return "ℕ";
        if (code === 80) return "ℙ";
        if (code === 81) return "ℚ";
        if (code === 82) return "ℝ";
        if (code === 90) return "ℤ";
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120055);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120049);
        if (code >= 48 && code <= 57) return String.fromCodePoint(code + 120744);
        return char;
      }).join("");
    }
  },
  {
    id: "monospace",
    name: "Monospace",
    description: "𝚃𝚎𝚌𝚑-𝚏𝚘𝚛𝚠𝚊𝚛𝚍 𝚌𝚘𝚍𝚎 𝚟𝚒𝚋𝚎",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120367);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120361);
        if (code >= 48 && code <= 57) return String.fromCodePoint(code + 120774);
        return char;
      }).join("");
    }
  },
  {
    id: "script-bold",
    name: "Script Bold",
    description: "𝓒𝓪𝓵𝓵𝓲𝓰𝓻𝓪𝓹𝓱𝓲𝓬 𝓕𝓵𝓸𝓾𝓻𝓲𝓼𝓱",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119887);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119879);
        return char;
      }).join("");
    }
  },
  {
    id: "script-light",
    name: "Script Light",
    description: "𝒢𝑒𝓃𝓉𝓁𝑒𝒞𝓊𝓇𝓋𝓎 𝒲𝓇ｉₜᵢₙg",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code === 66) return "ℬ";
        if (code === 69) return "ℰ";
        if (code === 70) return "ℱ";
        if (code === 72) return "ℋ";
        if (code === 73) return "ℐ";
        if (code === 76) return "ℒ";
        if (code === 82) return "ℛ";
        if (code === 101) return "ℯ";
        if (code === 103) return "ℊ";
        if (code === 111) return "ℴ";
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119835);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119829);
        return char;
      }).join("");
    }
  },
  {
    id: "fraktur-bold",
    name: "Fraktur Bold",
    description: "𝕲𝖔𝖙𝖍𝖎𝖈 𝕬𝖓𝖈𝖎𝖊𝖓𝖙 𝕻𝖔𝖜𝖊𝒓",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120107);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120101);
        return char;
      }).join("");
    }
  },
  {
    id: "fraktur-light",
    name: "Fraktur Light",
    description: "𝔊𝔬𝔱𝔥𝔦𝔠 𝔐𝔶𝔰𝔱𝔦𝔠𝔞𝔩 𝔗𝔢𝔵𝔱",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code === 67) return "ℭ";
        if (code === 72) return "ℌ";
        if (code === 73) return "ℑ";
        if (code === 82) return "ℜ";
        if (code === 90) return "ℨ";
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120003);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119997);
        return char;
      }).join("");
    }
  },
  {
    id: "circled",
    name: "Circled (Bubble)",
    description: "ⓐⓔⓢⓣⓗⓔⓣⓘⓒ ⓑⓤⓑⓑⓛⓔⓢ",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 9333);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 9327);
        if (char === "0") return "⓪";
        if (code >= 49 && code <= 57) return String.fromCodePoint(code + 9263);
        return char;
      }).join("");
    }
  },
  {
    id: "circled-dark",
    name: "Circled Dark",
    description: "🅐🅔🅢🅣🅗🅔🅣🅘🅒 🅓🅐🅡🅚",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 127247);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 127215);
        if (char === "0") return "⓿";
        if (code >= 49 && code <= 57) return String.fromCodePoint(code + 10053);
        return char;
      }).join("");
    }
  },
  {
    id: "squared",
    name: "Squared Lined",
    description: "🄰🄴🅂🅃🄷🄴🅃🄸🄲 🅂🅀🅄🄰🅁🄴🅂",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 127215);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 127183);
        return char;
      }).join("");
    }
  },
  {
    id: "squared-dark",
    name: "Squared Dark",
    description: "🅰🅴🆂🆃🅷🅴🆃🅸🅲 🅱🅻🅾🅲🅺🆂",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + 127279);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + 127247);
        return char;
      }).join("");
    }
  },
  {
    id: "fullwidth",
    name: "Wide / Fullwidth",
    description: "Ｗ  ｉ  ｄ  ｅ    Ｓ  ｐ  ａ  ｃ  ｅ",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        const code = char.charCodeAt(0);
        if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {
          return String.fromCodePoint(code + 65248);
        }
        return char;
      }).join("");
    }
  },
  {
    id: "smallcaps",
    name: "Small Caps",
    description: "Sᴍᴀʟʟ Cᴀᴘɪᴛᴀʟ Sᴛʏʟᴇs",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        return smallCapsMap[char] || char;
      }).join("");
    }
  },
  {
    id: "superscript",
    name: "Tiny Superscript",
    description: "ᵀⁱⁿʸ ᴴⁱᵍʰ ᴸᵉᵗᵗᵉʳˢ",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        if (char >= "A" && char <= "Z") return superscriptCapMap[char] || char;
        if (char >= "a" && char <= "z") return superscriptLowerMap[char] || char;
        return superscriptDigits[char] || char;
      }).join("");
    }
  },
  {
    id: "subscript",
    name: "Subscript",
    description: "tiny ₕₑᵣₑ ₗₒwₑᵣ ₗₑₜₜₑᵣₛ",
    category: "Special",
    transform: (text) => {
      return text.split("").map(char => {
        if ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z")) {
          return subscriptLowerMap[char] || char;
        }
        return subscriptDigits[char] || char;
      }).join("");
    }
  },
  {
    id: "upside-down",
    name: "Upside Down",
    description: "ʇxǝʇ uʍop ǝpᴉsdn ʎzzᴉp (Flipped reversed)",
    category: "Special",
    transform: (text) => {
      return text.split("").reverse().map(char => {
        return upsideDownMap[char] || char;
      }).join("");
    }
  }
];

function getCodePointsArray(str) {
  var result = [];
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < str.length) {
      var nextCode = str.charCodeAt(i + 1);
      if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
        result.push(str.charAt(i) + str.charAt(i + 1));
        i++;
        continue;
      }
    }
    result.push(str.charAt(i));
  }
  return result;
}

function applyModifiers(text, diacritic, prefix, suffix, spacing, uppercase, lowercase) {
  let processed = text;
  if (uppercase) processed = processed.toUpperCase();
  else if (lowercase) processed = processed.toLowerCase();

  if (spacing > 0) {
    processed = getCodePointsArray(processed).join(" ".repeat(spacing));
  }

  if (diacritic) {
    let d = diacritic;
    if (d === "strike" || d === "̶") d = "\u0336";
    else if (d === "under" || d === "̲") d = "\u0332";
    else if (d === "double" || d === "̳") d = "\u0333";

    processed = getCodePointsArray(processed).map(char => {
      if (char === " ") return char;
      if (d === "creepy") {
        const zalgoChars = ["\u0300", "\u0301", "\u0302", "\u0303", "\u0304", "\u0305", "\u0306", "\u0307", "\u0308", "\u0309", "\u030A", "\u030B", "\u030C", "\u030D", "\u030E", "\u0310", "\u0311", "\u0312", "\u0315", "\u031A", "\u031C", "\u031D", "\u0320", "\u0324", "\u0325", "\u0326", "\u0327", "\u0328", "\u032E", "\u0332", "\u0333", "\u0336", "\u0339", "\u033A", "\u033F", "\u0345", "\u034E", "\u0353", "\u0359", "\u035A", "\u035D", "\u035E"];
        let zalgo = char;
        const count = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < count; j++) {
          zalgo += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
        }
        return zalgo;
      }
      return char + d;
    }).join("");
  }

  return `${prefix}${processed}${suffix}`;
}

function initPresetsSelect() {
  const select = document.getElementById("deco-preset");
  DECO_PRESETS.forEach((preset, idx) => {
    const option = document.createElement("option");
    option.value = idx;
    option.textContent = preset.prefix ? `${preset.name} (${preset.prefix}x${preset.suffix})` : preset.name;
    select.appendChild(option);
  });
}

function computeStyleText(style) {
  const transformed = style.transform(state.inputText || " ");
  const deco = DECO_PRESETS[state.selectedDeco];
  return applyModifiers(
    transformed,
    state.selectedDiacritic,
    deco.prefix,
    deco.suffix,
    state.letterSpacing,
    state.textCase === "upper",
    state.textCase === "lower"
  );
}

function renderStylesGrid() {
  const grid = document.getElementById("styles-output-grid");
  grid.innerHTML = "";

  const filtered = UNICODE_STYLES.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          st.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory = state.selectedCategory === "All" || st.category === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-grid-msg">
        <p style="opacity: 0.5; font-size: 11px;">No matches found.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(style => {
    const outputVal = computeStyleText(style);
    const isFavorite = state.favorites.some(fav => fav.decodedText === outputVal);

    const card = document.createElement("div");
    card.className = `style-card ${isFavorite ? "favorite" : ""}`;
    card.id = `style-card-${style.id}`;

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="card-title">${style.name}</span>
          ${isFavorite ? '<span class="star-indicator">★</span>' : ''}
        </div>
        <p class="card-output-text">${outputVal}</p>
      </div>
      <div class="card-bottom-actions">
        <button class="card-action-btn favorite-btn ${isFavorite ? "active" : ""}">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${isFavorite ? "Bookmarked" : "FAV"}
        </button>
        <button class="card-action-btn primary copy-btn">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>COPY</span>
        </button>
      </div>
    `;

    card.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(outputVal);
      triggerToast("Copied stylized string!");

      const existsHistIndex = state.history.findIndex(h => h.text === outputVal);
      if (existsHistIndex >= 0) state.history.splice(existsHistIndex, 1);

      state.history.unshift({
        id: Math.random().toString(36).substring(2, 9),
        text: outputVal,
        styleName: style.name,
        copiedAt: Date.now()
      });

      if (state.history.length > 50) state.history.pop();
      saveHistory();

      const copyLabel = card.querySelector(".copy-btn span");
      copyLabel.textContent = "COPIED";
      setTimeout(() => {
        copyLabel.textContent = "COPY";
      }, 1500);
    });

    card.querySelector(".favorite-btn").addEventListener("click", () => {
      const index = state.favorites.findIndex(fav => fav.decodedText === outputVal);
      if (index >= 0) {
        state.favorites.splice(index, 1);
        triggerToast("Removed from Favorites!");
      } else {
        state.favorites.unshift({
          id: Math.random().toString(36).substring(2, 9),
          originalText: state.inputText,
          decodedText: outputVal,
          styleName: style.name,
          createdAt: Date.now()
        });
        triggerToast("Added to Favorites!");
      }
      saveFavorites();
      renderStylesGrid();
    });

    grid.appendChild(card);
  });
}

function updateSidebarFavorites() {
  const container = document.getElementById("favorites-list-container");
  const emptyState = document.getElementById("favorites-empty-state");
  const countLabel = document.getElementById("fav-count-label");
  const clearBtn = document.getElementById("clear-favs-btn");

  countLabel.textContent = state.favorites.length;

  if (state.favorites.length === 0) {
    container.style.display = "none";
    emptyState.style.display = "block";
    clearBtn.style.display = "none";
    return;
  }

  container.style.display = "flex";
  container.style.flexDirection = "column";
  emptyState.style.display = "none";
  clearBtn.style.display = "block";

  container.innerHTML = "";
  state.favorites.forEach(fav => {
    const card = document.createElement("div");
    card.className = "sidebar-card";

    card.innerHTML = `
      <div class="sidebar-card-header">
        <span class="sidebar-card-badge">${fav.styleName}</span>
        <div class="sidebar-card-actions">
          <button class="sidebar-icon-btn load-fav-btn" title="Load back into text window">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>
          <button class="sidebar-icon-btn copy-fav-btn" title="Quick copy to clipboard">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="sidebar-icon-btn remove-fav-btn" style="color:rgba(239, 68, 68, 0.7);" title="Delete bookmark">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <p class="sidebar-card-text">${fav.decodedText}</p>
    `;

    card.querySelector(".load-fav-btn").addEventListener("click", () => {
      document.getElementById("input-text").value = fav.originalText;
      state.inputText = fav.originalText;
      triggerToast("Loaded text!");
      renderStylesGrid();
    });

    card.querySelector(".copy-fav-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(fav.decodedText);
      triggerToast("Copied favorite!");
    });

    card.querySelector(".remove-fav-btn").addEventListener("click", () => {
      state.favorites = state.favorites.filter(item => item.id !== fav.id);
      saveFavorites();
      renderStylesGrid();
    });

    container.appendChild(card);
  });
}

function updateSidebarHistory() {
  const container = document.getElementById("history-list-container");
  const emptyState = document.getElementById("history-empty-state");
  const countLabel = document.getElementById("history-count-label");
  const clearBtn = document.getElementById("clear-history-btn");

  countLabel.textContent = state.history.length;

  if (state.history.length === 0) {
    container.style.display = "none";
    emptyState.style.display = "block";
    clearBtn.style.display = "none";
    return;
  }

  container.style.display = "flex";
  container.style.flexDirection = "column";
  emptyState.style.display = "none";
  clearBtn.style.display = "block";

  container.innerHTML = "";
  state.history.forEach(hist => {
    const card = document.createElement("div");
    card.className = "history-card";

    card.innerHTML = `
      <div class="history-details">
        <p class="history-text">${hist.text}</p>
        <span class="history-style-name">${hist.styleName}</span>
      </div>
      <button class="sidebar-icon-btn copy-hist-btn" title="Re-copy directly">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    `;

    card.querySelector(".copy-hist-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(hist.text);
      triggerToast("Re-copied text!");
    });

    container.appendChild(card);
  });
}

function initListeners() {
  const input = document.getElementById("input-text");
  input.addEventListener("input", (e) => {
    state.inputText = e.target.value;
    renderStylesGrid();
  });

  document.getElementById("clear-input-btn").addEventListener("click", () => {
    input.value = "";
    state.inputText = "";
    renderStylesGrid();
  });

  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      state.selectedCategory = e.target.dataset.cat;
      renderStylesGrid();
    });
  });

  const search = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear-btn");
  search.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    searchClear.style.display = e.target.value ? "block" : "none";
    renderStylesGrid();
  });

  searchClear.addEventListener("click", () => {
    search.value = "";
    state.searchQuery = "";
    searchClear.style.display = "none";
    renderStylesGrid();
  });

  const spacingRange = document.getElementById("spacing-range");
  const spacingLabel = document.getElementById("spacing-val-label");
  spacingRange.addEventListener("input", (e) => {
    state.letterSpacing = parseInt(e.target.value);
    spacingLabel.textContent = `+${state.letterSpacing}.0`;
    renderStylesGrid();
  });

  document.getElementById("deco-preset").addEventListener("change", (e) => {
    state.selectedDeco = parseInt(e.target.value);
    renderStylesGrid();
  });

  document.querySelectorAll("#diacritics-grid .mini-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll("#diacritics-grid .mini-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      state.selectedDiacritic = e.target.dataset.val;
      renderStylesGrid();
    });
  });

  document.querySelectorAll("#casing-grid .mini-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll("#casing-grid .mini-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      state.textCase = e.target.dataset.val;
      renderStylesGrid();
    });
  });

  const changeTheme = (theme, msg) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sif_theme", theme);
    updateThemeButtons(theme);
    triggerToast(msg);
  };
  
  document.getElementById("theme-btn-dark").addEventListener("click", () => {
    changeTheme("dark", "Switched Theme!");
  });
  document.getElementById("theme-btn-colored").addEventListener("click", () => {
    changeTheme("colored", "Switched Theme!");
  });
  document.getElementById("theme-btn-light").addEventListener("click", () => {
    changeTheme("light", "Switched Theme!");
  });

  document.getElementById("clear-favs-btn").addEventListener("click", () => {
    state.favorites = [];
    saveFavorites();
    renderStylesGrid();
    triggerToast("Cleared Favorites!");
  });

  document.getElementById("clear-history-btn").addEventListener("click", () => {
    state.history = [];
    saveHistory();
    triggerToast("Cleared History!");
  });
}

// Startup execution
document.addEventListener("DOMContentLoaded", () => {
  loadStorage();
  initPresetsSelect();
  initListeners();
  renderStylesGrid();
  updateSidebarFavorites();
  updateSidebarHistory();
});
