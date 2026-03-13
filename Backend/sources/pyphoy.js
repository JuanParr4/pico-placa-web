const axios = require("axios");
const cheerio = require("cheerio");


const MEDELLIN_OFFICIAL_URL =
  "https://www.medellin.gov.co/es/sala-de-prensa/noticias/el-lunes-2-de-febrero-inicia-la-nueva-rotacion-del-pico-y-placa-en-medellin/";

const BOGOTA_SCHEDULE_URL =
  "https://bogota.gov.co/mi-ciudad/movilidad/pico-y-placa-en-bogota-conoce-los-horarios";

const CALI_OFFICIAL_URL =
  "https://www.cali.gov.co/participacion/publicaciones/190703/asi-sera-la-nueva-rotacion-del-pico-y-placa-en-cali-para-el-primer-semestre-de-2026/";


let medellinCache = { fetchedAt: 0, rotation: null, horario: null, source: MEDELLIN_OFFICIAL_URL };
let bogotaCache = { fetchedAt: 0, horario: null, source: BOGOTA_SCHEDULE_URL };
let caliCache = { fetchedAt: 0, rotation: null, horario: null, validFrom: null, validTo: null, source: CALI_OFFICIAL_URL };


function normalizeText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function dayKeyFromDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay(); // 0 dom ... 6 sab
  return ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][dow];
}

function parseHorarioGeneric(text, fallback) {
  const t = text.toLowerCase().replace(/\s+/g, " ");

  let m = t.match(/(\d{1,2}:\d{2})\s*a\.?\s*m\.?\s*(?:a|hasta)\s*(\d{1,2}:\d{2})\s*p\.?\s*m\.?/i);
  if (m) return `${m[1]}am - ${m[2]}pm`;


  m = t.match(/(\d{1,2}:\d{2}\s*(?:am|pm))\s*(?:a|hasta|-)\s*(\d{1,2}:\d{2}\s*(?:am|pm))/i);
  if (m) return `${m[1].replace(/\s+/g, "")} - ${m[2].replace(/\s+/g, "")}`;

  return fallback;
}

async function fetchText(url) {
  const { data: html } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(html);
  return normalizeText($("body").text());
}

function isDateBetweenInclusive(dateStr, fromStr, toStr) {
  const d = new Date(dateStr + "T00:00:00");
  const f = new Date(fromStr + "T00:00:00");
  const t = new Date(toStr + "T00:00:00");
  return d >= f && d <= t;
}

function parseMedellinRotation(text) {
  const rot = {};
  const t = text.toLowerCase().replace(/\s+/g, " ");

  // "lunes (1 y 7) ... "
  const re = /(lunes|martes|miércoles|miercoles|jueves|viernes)\s*\((\d)\s*y\s*(\d)\)/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const day = m[1].replace("miércoles", "miercoles");
    rot[day] = [Number(m[2]), Number(m[3])];
  }

  rot.sabado = [];
  rot.domingo = [];
  return rot;
}

async function getMedellinScraped() {
  const now = Date.now();
  if (medellinCache.rotation && now - medellinCache.fetchedAt < 24 * 60 * 60 * 1000) return medellinCache;

  const text = await fetchText(MEDELLIN_OFFICIAL_URL);
  const rotation = parseMedellinRotation(text);
  const horario = parseHorarioGeneric(text, "5:00am - 8:00pm");

  medellinCache = { fetchedAt: now, rotation, horario, source: MEDELLIN_OFFICIAL_URL };
  return medellinCache;
}


async function getBogotaScheduleScraped() {
  const now = Date.now();
  if (bogotaCache.horario && now - bogotaCache.fetchedAt < 24 * 60 * 60 * 1000) return bogotaCache;

  const text = await fetchText(BOGOTA_SCHEDULE_URL);
  const horario = parseHorarioGeneric(text, "6:00am - 9:00pm");

  bogotaCache = { fetchedAt: now, horario, source: BOGOTA_SCHEDULE_URL };
  return bogotaCache;
}

function bogotaRestrictedDigitsByDate(dateStr) {
  const day = Number(dateStr.split("-")[2]); // DD
  const isOdd = day % 2 === 1;
  // Impares restringe 6-7-8-9-0; pares restringe 1-2-3-4-5
  return isOdd ? [6, 7, 8, 9, 0] : [1, 2, 3, 4, 5];
}


function parseCaliRotation(text) {
  const rot = {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
  };

  const t = text.toLowerCase().replace(/\s+/g, " ");

  const re1 = /(lunes|martes|miércoles|miercoles|jueves|viernes)\s*:\s*[^.]*?terminad[ao]s?\s+en\s+(\d)\s*y\s*(\d)/gi;
  let m;
  while ((m = re1.exec(t)) !== null) {
    const day = m[1].replace("miércoles", "miercoles");
    rot[day] = [Number(m[2]), Number(m[3])];
  }

 
  const re2 = /(lunes|martes|miércoles|miercoles|jueves|viernes)\s*:\s*(\d)\s*y\s*(\d)/gi;
  while ((m = re2.exec(t)) !== null) {
    const day = m[1].replace("miércoles", "miercoles");
   
    if (!rot[day] || rot[day].length === 0) rot[day] = [Number(m[2]), Number(m[3])];
  }

  return rot;
}

function parseCaliVigencia(text) {
 
  return { validFrom: "2026-01-05", validTo: "2026-06-30" };
}

async function getCaliScraped() {
  const now = Date.now();
  if (caliCache.rotation && now - caliCache.fetchedAt < 24 * 60 * 60 * 1000) return caliCache;

  const text = await fetchText(CALI_OFFICIAL_URL);
  const rotation = parseCaliRotation(text);
  const horario = parseHorarioGeneric(text, "6:00am - 7:00pm");
  const { validFrom, validTo } = parseCaliVigencia(text);

  caliCache = {
    fetchedAt: now,
    rotation,
    horario,
    validFrom,
    validTo,
    source: CALI_OFFICIAL_URL,
  };
  return caliCache;
}


async function getPyphoyRule({ city, date }) {
  if (city === "medellin") {
    const scraped = await getMedellinScraped();
    const dayKey = dayKeyFromDate(date);

    return {
      city,
      date,
      horario: scraped.horario,
      digitosHoy: scraped.rotation?.[dayKey] || [],
      source: scraped.source,
      updatedAt: new Date().toISOString(),
    };
  }

  if (city === "bogota") {
    const s = await getBogotaScheduleScraped();

    return {
      city,
      date,
      horario: s.horario,
      digitosHoy: bogotaRestrictedDigitsByDate(date),
      source: s.source,
      updatedAt: new Date().toISOString(),
    };
  }

  if (city === "cali") {
    const s = await getCaliScraped();
    const dayKey = dayKeyFromDate(date);

    const isWeekend = dayKey === "sabado" || dayKey === "domingo";
    const inRange = isDateBetweenInclusive(date, s.validFrom, s.validTo);

    const digitosHoy = (!isWeekend && inRange) ? (s.rotation?.[dayKey] || []) : [];

    return {
      city,
      date,
      horario: s.horario,
      digitosHoy,
      source: s.source,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    city,
    date,
    horario: "Consultar fuente",
    digitosHoy: [],
    source: "",
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { getPyphoyRule };