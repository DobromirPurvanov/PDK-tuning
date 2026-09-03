// Честите въпроси (план, стр. 18): 4 групи — преди, по време, след, пари. Първите 4 влизат и на началната.
// Списъкът се съгласува с възложителя (реални разговори с клиенти) — това е първата редакция.
import type { Lang } from '@/i18n';
import prices from './prices.json';
const p = prices.items;
export interface FaqGroup { title: Record<Lang, string>; items: Record<Lang, { q: string; a: string }[]> }
export const FAQ: FaqGroup[] = [
  { title: { bg: 'Преди', en: 'Before' }, items: {
    bg: [
      { q: 'За коя кола има смисъл чип тунинг?', a: 'За всяка с турбо — дизел или бензин — на възраст от 2 до 15 години и в добро механично състояние. При атмосферни бензинови двигатели ръстът е малък и го казваме предварително. Проверете своя двигател в каталога: числата там са реални, не рекламни.' },
      { q: 'Колко време остава колата при вас?', a: `Stage 1 — ${p['chip-tuning'].time}, включително диагностика и измерване на стенда. Софтуерните ремонти (DPF, EGR, AdBlue) — от 1 до 3 часа. Можете да изчакате в сервиза.` },
      { q: 'Губя ли гаранцията на автомобила?', a: 'Всяка промяна в софтуера на двигателя е основание производителят да откаже гаранция. При кола в заводска гаранция не препоръчваме намеса и ще ви кажем защо — по-добре да изчакате, отколкото да спорите с дилъра.' },
      { q: 'Трябва ли предварително записване?', a: 'Да — обадете се, за да запазим час и да подготвим файла за вашия двигател. Спешни случаи (кола в куц режим, AdBlue отброяване) гледаме в същия ден, ако е възможно.' },
    ],
    en: [
      { q: 'Which cars are worth remapping?', a: 'Any turbocharged engine — diesel or petrol — from 2 to 15 years old in good mechanical condition. Naturally aspirated petrols gain little and we say so up front. Check the engine in the catalog: the figures are measured, not marketing.' },
      { q: 'How long does the car stay with you?', a: `Stage 1 — ${p['chip-tuning'].time.replace('ч', 'h')}, including diagnostics and the dyno run. Software repairs (DPF, EGR, AdBlue) — 1 to 3 hours. You can wait at the workshop.` },
      { q: 'Do I lose the manufacturer warranty?', a: 'Any change to the engine software is grounds for a manufacturer to refuse warranty. On a car under factory warranty we do not recommend it and will tell you why.' },
      { q: 'Do I need an appointment?', a: 'Yes — call so we can book a slot and prepare the file for your engine. Urgent cases (limp mode, AdBlue countdown) are seen the same day where possible. Partner workshops: portal upload, no appointment needed.' },
    ],
  } },
  { title: { bg: 'По време', en: 'During' }, items: {
    bg: [
      { q: 'Какво точно правите с колата?', a: 'Четем грешките, проверяваме здравето на двигателя, сваляме оригиналния софтуер (по OBD или на маса), пишем файла за точно този двигател, качваме го и мерим на стенда преди и след. Всичко се вижда — можете да стоите до колата.' },
      { q: 'Отваряте ли блока на двигателя?', a: 'При повечето коли до 2016 г. — не, всичко минава през диагностичния куплунг. При по-новите блокове с защита (например Bosch MD1/MG1, някои Continental) блокът се сваля и се чете на маса — това е 1–2 часа повече и го казваме предварително.' },
      { q: 'Мога ли да изчакам?', a: 'Да. Има място за чакане и кафе. Ако предпочитате, ви се обаждаме, когато е готово.' },
    ],
    en: [
      { q: 'What exactly do you do to the car?', a: 'Read the fault memory, check engine health, read the original software (OBD or bench), write the file for exactly this engine, flash it and measure on the dyno before and after. You can stand next to the car.' },
      { q: 'Do you open the ECU?', a: 'On most cars up to 2016 — no, everything goes through the diagnostic port. Newer protected ECUs (Bosch MD1/MG1, some Continental) come out and are read on the bench — 1–2 hours more, and we say so in advance.' },
      { q: 'What do partner workshops send?', a: 'The original read-out (full or OBD), ECU type and software number, the requested stage or repair, and the intended use of the vehicle. Files come back through the portal the same working day.' },
    ],
  } },
  { title: { bg: 'След', en: 'After' }, items: {
    bg: [
      { q: 'Може ли да се върне фабричният софтуер?', a: 'Да, по всяко време. Оригиналният файл се пази при нас и връщането отнема под час.' },
      { q: 'Какво става при сервизно обслужване в дилър?', a: 'При обновяване на софтуера от дилъра файлът се презаписва с фабричния. Ако това стане, идвате и го качваме отново — за наши клиенти това е включено в цената.' },
      { q: 'Има ли повече разход или износване?', a: 'При Stage 1 разходът при спокойно каране обикновено пада с 5–10%, защото двигателят работи с повече момент при по-ниски обороти. Износването зависи от това как се кара, не от файла — но при по-голяма мощност съветваме по-кратък интервал за масло.' },
      { q: 'Какво ако нещо не е наред след тунинга?', a: 'Обаждате се и идвате. Проверяваме на стенда, четем данните и оправяме. Файлът е с гаранция за наша грешка — това не покрива механични проблеми, които са съществували преди.' },
    ],
    en: [
      { q: 'Can the stock software be restored?', a: 'Yes, at any time. The original file is kept and restoring it takes under an hour.' },
      { q: 'What happens at a dealer service?', a: 'A dealer software update overwrites the file with stock. If that happens, the file is re-flashed — included for our customers.' },
      { q: 'More consumption or wear?', a: 'With Stage 1, consumption at normal driving usually drops 5–10% because the engine has more torque at lower revs. Wear depends on how the car is driven, not on the file — with more power we advise a shorter oil interval.' },
      { q: 'What if something is wrong afterwards?', a: 'Call and come in. We check on the dyno, read the data and fix it. The file is guaranteed against our error — this does not cover mechanical faults that existed before.' },
    ],
  } },
  { title: { bg: 'Пари', en: 'Money' }, items: {
    bg: [
      { q: 'Колко струва чип тунинг?', a: `Stage 1 от ${p['chip-tuning'].from} € с измерване преди и след. Крайната цена зависи от блока (по OBD или на маса) и се казва по телефона, преди да дойдете. Всички начални цени са на страницата с цените.` },
      { q: 'Как се плаща?', a: 'В брой или с карта в сервиза, след като видите числата на стенда. За сервизи партньори — по фактура през портала.' },
      { q: 'Има ли гаранция на услугата?', a: 'Да — за файла и за работата ни. Ако проблемът е в нашия файл, оправяме го безплатно. Не покриваме механични проблеми на двигателя, турбото или скоростната кутия.' },
      { q: 'Включена ли е диагностиката в цената?', a: `Диагностиката е ${p.diagnostics.from} € и се приспада от цената на услугата, ако продължим. Ако решим, че чип тунинг не е за вашата кола, плащате само нея.` },
    ],
    en: [
      { q: 'What does a remap cost?', a: `Stage 1 from ${p['chip-tuning'].from} € including a before/after dyno run. The final price depends on the ECU (OBD or bench) and is confirmed by phone. All starting prices are on the prices page. Partner workshops have their own file-service price list in the portal.` },
      { q: 'How do I pay?', a: 'Cash or card at the workshop, after you have seen the figures on the dyno. Partner workshops — by invoice through the portal.' },
      { q: 'Is the service guaranteed?', a: 'Yes — the file and our work. If the problem is in our file we fix it free of charge. We do not cover mechanical faults of the engine, turbo or gearbox.' },
      { q: 'Is diagnostics included?', a: `Diagnostics is ${p.diagnostics.from} € and is deducted from the service price if we go ahead. If we decide a remap is not right for your car, you pay only that.` },
    ],
  } },
];
export const faqFlat = (lang: Lang) => FAQ.flatMap((g) => g.items[lang]);
