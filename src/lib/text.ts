// Сглобени абзаци за каталожните страници — по гориво и по големина на ръста (план, стр. 20, блок 02).
import type { Lang } from '@/i18n';
import { type Engine, type Fuel, hpGain, nmGain, hpPct, engineLabel } from './catalog';
import prices from '@/data/prices.json';

const turbo = (e: Engine) => /\b(t|tsi|tfsi|turbo|thp|ecoboost|tce|t-gdi|tgdi|gti|dig-t|turbocharged)\b|\d+t\b/i.test(engineLabel(e));
export function whatChanges(lang: Lang, e: Engine): string {
  const g = hpGain(e), nm = nmGain(e), pct = hpPct(e), name = engineLabel(e);
  const nmS = nm != null && nm > 0 ? (lang === 'bg' ? ` и +${nm} Nm` : ` and +${nm} Nm`) : '';
  if (e.fuel === 'electric') return lang === 'bg'
    ? `${name} е електрически или хибриден агрегат: ръстът от +${g} к.с. идва от промяна в ограниченията на мощността в управляващия блок, а не от гориво и налягане. Уговорката е за температурния режим на батерията — казваме я преди работа.`
    : `${name} is an electric or hybrid unit: the +${g} hp comes from changed power limits in the controller, not from fuel and boost. The condition is battery thermal management — we explain it before the work.`;
  if (e.fuel === 'diesel') {
    if (pct >= 25) return lang === 'bg'
      ? `Дизелът с турбо е най-благодарният за чип тунинг двигател. При ${name} +${g} к.с.${nmS} идват от по-високо налягане на турбото и коригирано впръскване, без механични промени. Усеща се най-вече между 1 800 и 3 500 оборота — там, където карате всеки ден: изпреварване, натоварена кола, ремарке.`
      : `A turbo diesel is the most rewarding engine to remap. On the ${name}, +${g} hp${nmS} come from higher boost and corrected injection with no mechanical changes. Felt mostly between 1,800 and 3,500 rpm — where the car is driven every day: overtaking, loaded, towing.`;
    return lang === 'bg'
      ? `Ръстът при ${name} е умерен — +${g} к.с. — защото фабричната настройка вече е близо до безопасната граница на турбото. Печалбата е в момента: ${nm != null && nm > 0 ? `+${nm} Nm в средния диапазон` : 'по-пълна крива в средния диапазон'}, което се усеща като по-лесно изпреварване и по-ниски обороти при същата скорост.`
      : `The gain on the ${name} is moderate — +${g} hp — because the factory calibration already sits close to the turbo’s safe limit. The benefit is torque: ${nm != null && nm > 0 ? `+${nm} Nm in the mid-range` : 'a fuller mid-range curve'}, felt as easier overtaking and lower revs at the same speed.`;
  }
  if (turbo(e) || pct >= 15) return lang === 'bg'
    ? `Бензиновият турбодвигател ${name} печели от по-високо налягане и коригирано запалване: +${g} к.с.${nmS}, с по-пълен момент от 2 000 оборота нагоре. Изисква гориво 98 или 100 октана — това е част от уговорката, не дребен шрифт.`
    : `The ${name} turbo petrol gains from higher boost and corrected ignition timing: +${g} hp${nmS}, with fuller torque from 2,000 rpm up. It requires 98 or 100 octane fuel — part of the deal, not small print.`;
  return lang === 'bg'
    ? `${name} е атмосферен бензинов двигател: ръстът е ограничен до +${g} к.с., защото няма турбо, което да се пренастрои. Промяната е в по-острата реакция на педала и по-равномерната крива, не в „нова кола“. Казваме го предварително.`
    : `The ${name} is a naturally aspirated petrol: the gain is limited to +${g} hp because there is no turbo to recalibrate. The change is a sharper throttle and a smoother curve, not “a new car”. We say so up front.`;
}
export function timeAndPrice(lang: Lang): string {
  const p = prices.items['chip-tuning'];
  return lang === 'bg'
    ? `Stage 1 файл от ${p.from} € с измерване преди и след на стенда. Колата остава при нас ${p.time}. Крайната цена зависи от блока — по OBD или на маса — и се казва по телефона, преди да дойдете.`
    : `Stage 1 file from ${p.from} € including a before/after dyno run. The car stays with us ${p.time.replace('ч', 'h')}. The final price depends on the ECU — OBD or bench — and is confirmed by phone before you come.`;
}
export function engineFaq(lang: Lang, brand: string, model: string, e: Engine) {
  const name = engineLabel(e), g = hpGain(e), pct = hpPct(e), p = prices.items['chip-tuning'];
  return lang === 'bg' ? [
    { q: `Колко коня дава ${brand} ${model} ${name} след чип тунинг?`, a: `Фабрично ${e.hpStock} к.с.${e.nmStock != null ? ` и ${e.nmStock} Nm` : ''}. След файла — ${e.hpTuned} к.с.${e.nmTuned != null ? ` и ${e.nmTuned} Nm` : ''}, измерени на стенда. Разликата е +${g} к.с. (+${pct}%).` },
    { q: `Колко струва чип тунинг за ${name} и колко трае?`, a: `Stage 1 от ${p.from} € с измерване преди и след. Колата остава ${p.time}. Диагностиката преди работа е задължителна — чип тунинг на болен двигател не правим.` },
    { q: `Може ли ${name} да се върне към фабричния софтуер?`, a: `Да. Оригиналният файл се пази и се връща за под час. При кола в заводска гаранция не препоръчваме намеса — всяка промяна в софтуера е основание производителят да откаже гаранция.` },
  ] : [
    { q: `How much power does the ${brand} ${model} ${name} make after a remap?`, a: `Stock: ${e.hpStock} hp${e.nmStock != null ? ` and ${e.nmStock} Nm` : ''}. After the file: ${e.hpTuned} hp${e.nmTuned != null ? ` and ${e.nmTuned} Nm` : ''}, dyno-measured. The difference is +${g} hp (+${pct}%).` },
    { q: `What does a ${name} file cost and how fast is it?`, a: `Stage 1 from ${p.from} € with a before/after dyno run in Varna. Partner workshops: send the original read-out through the portal; files are returned the same working day.` },
    { q: `Can the ${name} go back to stock?`, a: `Yes. The original file is kept and restored in under an hour. On a car under manufacturer warranty we do not recommend any change — a software change is grounds to refuse warranty.` },
  ];
}
export const fuelName = (lang: Lang, f: Fuel) => (lang === 'bg' ? { diesel: 'дизел', petrol: 'бензин', electric: 'електро' } : { diesel: 'diesel', petrol: 'petrol', electric: 'electric' })[f];
