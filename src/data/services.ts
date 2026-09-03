// Седемте услуги (план, стр. 17 и приложение А). Всяка страница има един и същ скелет:
// проблемът с думите на клиента → какво правим → кога има смисъл и кога не → закон и преглед →
// цена и време → за кои коли → 3 въпроса → действие.
// ЗАДЪЛЖИТЕЛНО: формулировките за емисионните системи се потвърждават от възложителя преди публикуване.
import type { Lang } from '@/i18n';
type L<T = string> = Record<Lang, T>;
export interface Service {
  slug: string; priceKey: string; fuel: 'diesel' | 'petrol' | 'both'; legacy: string;
  name: L; short: L; h1: L; title: L; description: L; queries: string[];
  problem: L<string[]>; what: L<string[]>; yes: L<string[]>; no: L<string[]>; legal: L<string[]>; price: L<string[]>;
  faq: L<{ q: string; a: string }[]>;
}
const LEGAL_BG_EMISSIONS = [
  'Системите за пречистване на изгорелите газове (DPF, EGR, AdBlue/SCR, катализатор, ламбда сонди) са част от типовото одобрение на автомобила. За кола, която се движи по обществените пътища в ЕС, те трябва да са налични и изправни. Софтуерното им изключване на такъв автомобил не е позволено и не издържа на изпитание за емисии при технически преглед.',
  'Затова тази услуга е за автомобили извън обществените пътища: спортна употреба, пистови и офроуд машини, техника на затворени площадки, автомобили за износ извън ЕС. Преди работа подписвате декларация за предназначението на автомобила. Ако колата ви е за ежедневно движение по пътя, ще ви предложим ремонт или регенерация вместо изключване — и ще ви кажем защо.',
];
const LEGAL_EN_EMISSIONS = [
  'Exhaust after-treatment systems (DPF, EGR, AdBlue/SCR, catalyst, lambda sensors) are part of the vehicle type approval. A car used on public roads in the EU must have them fitted and working. Switching them off in software on such a car is not permitted and will not pass an emissions test at roadworthiness inspection.',
  'This service is therefore for vehicles used off public roads: motorsport, track and off-road machines, closed-site equipment, vehicles exported outside the EU. The workshop handling the car is responsible for confirming the intended use with its customer. For a daily road car we recommend repair or regeneration instead — and we say so.',
];
export const SERVICES: Service[] = [
  {
    slug: 'dpf-fap', priceKey: 'dpf-fap', fuel: 'diesel', legacy: 'dpf-and-fap',
    name: { bg: 'DPF / FAP филтър', en: 'DPF / FAP' },
    short: { bg: 'Запушен филтър за твърди частици: диагностика, регенерация, софтуерно решение.', en: 'Blocked particulate filter: diagnosis, forced regeneration, software solution.' },
    h1: { bg: 'DPF филтър — запушен, свети лампа, куца режим', en: 'DPF / FAP — diagnosis, regeneration and software solution' },
    title: { bg: 'DPF филтър Варна — регенерация или премахване | PDK Tuning', en: 'DPF / FAP solution for workshops | PDK Tuning file service' },
    description: { bg: 'Запушен DPF филтър във Варна: диагностика за 30 минути, принудителна регенерация или софтуерно решение за коли извън пътя. Честно казваме кое има смисъл.', en: 'DPF / FAP file service for partner workshops: diagnosis first, forced regeneration where it makes sense, software solution for off-road vehicles. Same day.' },
    queries: ['премахване на dpf', 'dpf филтър варна', 'запушен филтър за твърди частици'],
    problem: {
      bg: ['Свети лампата за филтъра. Колата „куца“ — не вдига над 3 000 оборота, губи мощност на магистрала. Пуши на студено, вдига разхода, а регенерацията, която сервизът е пускал, издържа седмица. Познато.', 'Филтърът за твърди частици (DPF при VAG, BMW, Mercedes; FAP при Peugeot, Citroën, Ford) улавя саждите и ги изгаря при висока температура. При градско каране температурата не се достига, филтърът се пълни, а компютърът ограничава двигателя, за да го пази.'],
      en: ['The DPF light is on, the car is in limp mode and will not rev past 3,000 rpm, it smokes on cold start and the forced regeneration your customer paid for lasted a week. You know the pattern.', 'The particulate filter traps soot and burns it at high exhaust temperature. In town the temperature is never reached, the filter fills up and the ECU derates the engine to protect it.'],
    },
    what: {
      bg: ['Първо диагностика: четем противоналягането и стойността на натрупаните сажди от самия блок, проверяваме диференциалния датчик и температурните сонди. В една трета от случаите проблемът не е филтърът, а датчик за 40 €.', 'Ако филтърът е годен — принудителна регенерация със сервизен уред, при контролирана температура. Ако е под 60% запълнен и датчиците са здрави, това е решението за път.', 'Ако филтърът е физически повреден, стопен или колата не е за път — софтуерно решение: файл, в който DPF стратегията е изключена, без грешки и без куц режим, при запазени останалите функции. Правим го на маса или по OBD според блока.'],
      en: ['Diagnosis first: we read back-pressure and the soot load model from the ECU and check the differential pressure and temperature sensors. In a third of cases the fault is a €40 sensor, not the filter.', 'If the filter is usable — forced regeneration under controlled temperature. Under roughly 60% load with healthy sensors this is the road-legal fix.', 'If the filter is physically damaged or the vehicle is not for road use — a file with the DPF strategy switched off cleanly: no fault codes, no limp mode, all other functions kept. Written per ECU, delivered through the portal.'],
    },
    yes: { bg: ['филтърът е стопен или напукан и нов струва повече от колата', 'колата е за писта, офроуд, затворена площадка или износ извън ЕС', 'товарна или строителна техника без задължителен преглед за емисии по това перо'], en: ['the filter is melted or cracked and a new one costs more than the car', 'track, off-road, closed-site or export vehicle', 'commercial or plant machinery outside the emissions test scope'] },
    no: { bg: ['колата е ежедневна и минава технически преглед — регенерация или нов филтър', 'проблемът е датчик или термостат — сменя се и филтърът работи', 'двигател с механичен проблем (маслоядене, турбо) — саждите ще се върнат, колкото и файла да пишем'], en: ['daily road car that goes through inspection — regeneration or a new filter', 'the fault is a sensor or a thermostat — replace it and the filter works', 'engine with a mechanical fault (oil consumption, turbo) — soot will come back whatever the file'] },
    legal: { bg: LEGAL_BG_EMISSIONS, en: LEGAL_EN_EMISSIONS },
    price: { bg: ['Диагностиката е с фиксирана цена и се приспада, ако продължим. Регенерацията отнема около час. Софтуерното решение — 2 до 3 часа, колата остава при нас в рамките на деня.'], en: ['Diagnosis is a fixed fee. Forced regeneration takes about an hour. The software solution is written the same working day — send the original file through the portal with the ECU type and photos of the fault memory.'] },
    faq: {
      bg: [
        { q: 'Може ли само да се изчисти филтърът?', a: 'Да, ако е цял. Химично почистване или принудителна регенерация връщат филтъра, когато запълването е под 60% и датчиците са здрави. Първо мерим, после решаваме.' },
        { q: 'Ще свети ли лампа след софтуерното решение?', a: 'Не. Файлът се пише така, че блокът не очаква филтър — няма грешки, няма куц режим, няма опити за регенерация.' },
        { q: 'Трябва ли и физическо премахване?', a: 'При софтуерно решение филтърът се вади или се изрязва вътрешността, защото запушен филтър без регенерация ще спре колата. Това е механична работа и се прави в сервиза.' },
      ],
      en: [
        { q: 'Can the filter just be cleaned?', a: 'Yes, if it is intact. Chemical cleaning or a forced regeneration recover a filter below roughly 60% load with healthy sensors. We measure first, then decide.' },
        { q: 'Will a warning light stay on after the file?', a: 'No. The file is written so the ECU no longer expects a filter — no fault codes, no limp mode, no regeneration attempts.' },
        { q: 'What do you need from a partner workshop?', a: 'The original read-out (full or via OBD), ECU type and software number, a photo of the fault memory and the intended use of the vehicle. Files are returned through the portal.' },
      ],
    },
  },
  {
    slug: 'egr', priceKey: 'egr', fuel: 'diesel', legacy: 'egr-off-and-swirl-flaps',
    name: { bg: 'EGR и вихрови клапи', en: 'EGR and swirl flaps' },
    short: { bg: 'Задръстен EGR клапан, паднали вихрови клапи: почистване, смяна или софтуер.', en: 'Clogged EGR valve, failed swirl flaps: clean, replace or software.' },
    h1: { bg: 'EGR клапан и вихрови клапи — грешка, сажди, загуба на мощност', en: 'EGR and swirl flaps — fault codes, soot, lost power' },
    title: { bg: 'EGR клапан Варна — почистване, смяна, изключване | PDK Tuning', en: 'EGR and swirl flap solution for workshops | PDK Tuning' },
    description: { bg: 'EGR клапан във Варна: диагностика, почистване или смяна, софтуерно изключване за коли извън пътя. Вихрови клапи — преди да паднат в двигателя. Цена и време.', en: 'EGR and swirl flap file service for partner workshops: clean or replace first, software solution for off-road vehicles. Swirl flaps removed before they drop.' },
    queries: ['изключване на egr', 'egr клапан варна', 'вихрови клапи'],
    problem: {
      bg: ['Грешка за EGR, неравномерни обороти на празен ход, черен дим при газ, куц режим. При BMW, Mercedes и VAG дизелите отпреди 2012 г. — и вихровите клапи в смукателния колектор, които със саждите блокират, а при по-старите мотори падат в цилиндъра.', 'EGR клапанът връща част от изгорелите газове обратно в двигателя, за да намали азотните окиси. Саждите от тези газове с годините го задръстват — заедно със смукателния колектор.'],
      en: ['EGR fault code, rough idle, black smoke on throttle, limp mode. On pre-2012 BMW, Mercedes and VAG diesels — plus the swirl flaps in the intake manifold that seize with soot or, on older engines, drop into the cylinder.', 'The EGR valve returns part of the exhaust into the intake to reduce NOx. The soot in that exhaust clogs the valve and the manifold over the years.'],
    },
    what: {
      bg: ['Диагностика с реални стойности: колко отваря клапанът, какво чете дебитомерът, има ли подсмукване. После: почистване на клапана и колектора, смяна с нов, или — за автомобили извън пътя — файл с изключена EGR стратегия.', 'Вихрови клапи: сваляме ги от колектора и слагаме заглушки, а в софтуера изключваме управлението им, за да няма грешка. Това е превантивна работа при моторите, при които е известно, че падат.'],
      en: ['Diagnosis with live data: valve opening, MAF reading, air leaks. Then: cleaning the valve and manifold, replacement, or — for off-road vehicles — a file with the EGR strategy disabled.', 'Swirl flaps: removed from the manifold with blanking plates; the actuator is disabled in the file so no fault is logged. Preventive work on engines known to drop flaps.'],
    },
    yes: { bg: ['клапанът е сменян два пъти и пак се задръства — колата е градска и никога не загрява', 'вихровите клапи са от рисковата серия и се маха, преди да е станало скъпо', 'колата не е за обществени пътища'], en: ['the valve has been replaced twice and still clogs — short urban trips, never warm', 'swirl flaps from a known risk series, removed before it gets expensive', 'vehicle not used on public roads'] },
    no: { bg: ['ежедневна кола с преглед — почистваме или сменяме', 'грешката е от подсмукване или датчик — оправя се без файл', 'нов автомобил в гаранция — не пипаме'], en: ['daily road car — clean or replace', 'the fault is an air leak or a sensor — fixed without a file', 'new car under warranty — we do not touch it'] },
    legal: { bg: LEGAL_BG_EMISSIONS, en: LEGAL_EN_EMISSIONS },
    price: { bg: ['Почистването е 1–2 часа. Софтуерното решение — около час, ако блокът се чете по OBD, и половин ден, ако се отваря. Вихровите клапи — 2–3 часа механична работа плюс файла.'], en: ['Software solution about an hour if the ECU reads via OBD, half a day if it has to be opened. Swirl flap removal is 2–3 hours of mechanical work plus the file.'] },
    faq: {
      bg: [
        { q: 'Какво става с разхода след изключен EGR?', a: 'Двигателят гори по-чист въздух и работи по-равномерно. Разходът обикновено леко пада, но целта на услугата не е икономия — тя е чист смукателен колектор.' },
        { q: 'Трябва ли и механично запушване?', a: 'При софтуерно изключване клапанът остава затворен и по принцип не е нужно. При стар, залепнал в отворено положение клапан се слага заглушка.' },
        { q: 'Ще има ли грешка при преглед?', a: 'Изключването не е за коли, които минават преглед — виж раздела за закона. Ако колата ви е за път, ще ви предложим почистване или смяна.' },
      ],
      en: [
        { q: 'Does EGR-off affect fuel consumption?', a: 'The engine breathes cleaner air and runs smoother; consumption usually drops slightly. The point of the service is a clean intake, not economy.' },
        { q: 'Is a mechanical blank needed?', a: 'With the software solution the valve stays closed and normally no blank is needed. A valve stuck open needs a blanking plate.' },
        { q: 'Which ECUs do you support?', a: 'Bosch EDC15/16/17, Siemens/Continental SID, Delphi DCM and most Denso diesel ECUs. Send the read-out and we confirm before you commit.' },
      ],
    },
  },
  {
    slug: 'adblue', priceKey: 'adblue', fuel: 'diesel', legacy: '',
    name: { bg: 'AdBlue / SCR', en: 'AdBlue / SCR' },
    short: { bg: 'Грешка AdBlue, отброяване до спиране на двигателя: диагностика и решение.', en: 'AdBlue fault, countdown to no-start: diagnosis and solution.' },
    h1: { bg: 'AdBlue / SCR система — грешка, отброяване, „няма да запали след 800 км“', en: 'AdBlue / SCR — fault, countdown, “no start in 800 km”' },
    title: { bg: 'AdBlue грешка Варна — ремонт или изключване на SCR | PDK Tuning', en: 'AdBlue / SCR solution for workshops | PDK Tuning file service' },
    description: { bg: 'AdBlue грешка във Варна: диагностика на SCR системата, ремонт на дозатор, нагревател или NOx датчик, софтуерно решение за техника извън пътя. Без отброяване.', en: 'AdBlue / SCR file service for partner workshops: NOx sensor, doser and heater diagnosis first, software solution for off-road and export vehicles.' },
    queries: ['adblue изключване', 'scr система', 'грешка adblue'],
    problem: {
      bg: ['„Грешка AdBlue — двигателят няма да запали след 800 км.“ Отброяването върви, а сервизът иска 1 500 € за NOx датчик, дозатор и резервоар с нагревател. Най-често при Mercedes, BMW, VW/Audi, Peugeot след 2015 г., и при камиони и трактори — постоянно.', 'SCR системата впръсква разтвор на карбамид (AdBlue) в изгорелите газове, за да превърне азотните окиси в азот. Кристализиралият разтвор, замръзнал нагревател или умрял NOx датчик карат блока да брои километри до спиране.'],
      en: ['“AdBlue fault — engine will not start in 800 km.” The countdown is running and the dealer quotes €1,500 for a NOx sensor, doser and heated tank. Common on Mercedes, BMW, VW/Audi and Peugeot after 2015 — and on trucks and tractors all the time.', 'The SCR system injects urea solution into the exhaust to turn NOx into nitrogen. Crystallised urea, a failed tank heater or a dead NOx sensor make the ECU count down to a no-start.'],
    },
    what: {
      bg: ['Диагностика на цялата верига: NOx датчици преди и след катализатора, дозатор, помпа, нагревател, качество на течността. Голяма част от случаите са един датчик или кристализирал дозатор — това се ремонтира и колата е за път.', 'За товарна и строителна техника, за автомобили за износ и за коли извън обществените пътища — файл, в който SCR стратегията е изключена: без отброяване, без ограничение на мощността, без грешки.'],
      en: ['Diagnosis of the full chain: upstream and downstream NOx sensors, doser, pump, heater, fluid quality. Many cases are one sensor or a crystallised doser — repairable, and the vehicle stays road-legal.', 'For trucks, plant machinery, export vehicles and off-road use — a file with the SCR strategy disabled: no countdown, no derate, no fault codes.'],
    },
    yes: { bg: ['камион, багер или трактор, на който системата спира работата в най-неподходящия момент', 'автомобил за износ извън ЕС или за затворена площадка', 'ремонтът струва повече от половината от стойността на машината'], en: ['truck, excavator or tractor that the system stops at the worst moment', 'vehicle for export outside the EU or closed-site use', 'the repair costs more than half the machine is worth'] },
    no: { bg: ['лек автомобил за ежедневна употреба с преглед — ремонтираме', 'грешката е от лоша течност — сменя се и се нулира', 'кола в гаранция'], en: ['daily road car — we repair', 'the fault is bad fluid — replace and reset', 'car under warranty'] },
    legal: { bg: LEGAL_BG_EMISSIONS, en: LEGAL_EN_EMISSIONS },
    price: { bg: ['Диагностиката е около час. Софтуерното решение зависи от блока: при повечето леки коли 2–3 часа, при камиони с отделен SCR модул — до един ден.'], en: ['Most passenger-car ECUs: 2–3 hours. Trucks with a separate SCR/DCU module: up to one day. Send both the engine ECU and the DCU read-out where applicable.'] },
    faq: {
      bg: [
        { q: 'Ще спре ли отброяването веднага?', a: 'Да. След записа на файла блокът не следи SCR системата и отброяването изчезва, заедно с ограничението на мощността.' },
        { q: 'Може ли само да се нулира броячът?', a: 'Нулирането е временно — при следващата грешка започва отново. Ако причината е ремонтируема, ремонтираме; ако не, решението е софтуерно.' },
        { q: 'Работите ли по камиони и трактори?', a: 'Да — това е голяма част от AdBlue работата ни: Euro 5 и Euro 6 камиони, селскостопанска и строителна техника.' },
      ],
      en: [
        { q: 'Does the countdown stop immediately?', a: 'Yes. Once the file is written the ECU no longer monitors the SCR system; the countdown and the derate disappear.' },
        { q: 'Can the counter just be reset?', a: 'A reset is temporary — the next fault starts it again. If the cause is repairable we say so; if not, the solution is in the file.' },
        { q: 'Trucks and tractors?', a: 'Yes — a large part of our AdBlue work is Euro 5 and Euro 6 trucks, agricultural and construction machinery.' },
      ],
    },
  },
  {
    slug: 'lambda', priceKey: 'lambda', fuel: 'petrol', legacy: 'o2-lambda-off',
    name: { bg: 'Lambda / O2 сонда', en: 'Lambda / O2' },
    short: { bg: 'Грешка за катализатора или ламбда сондата след катализатора.', en: 'Catalyst efficiency or post-cat lambda fault.' },
    h1: { bg: 'Ламбда сонда и катализатор — P0420, грешка за ефективност', en: 'Lambda sensor and catalyst — P0420, efficiency fault' },
    title: { bg: 'Ламбда сонда Варна — P0420, катализатор, изключване | PDK Tuning', en: 'Lambda / O2 off for workshops | PDK Tuning file service' },
    description: { bg: 'Грешка P0420 или ламбда сонда във Варна: диагностика на катализатора, смяна на сондата или софтуерно решение за спортни и пистови коли. Казваме честно кое е за път.', en: 'Lambda / O2 file service for workshops: catalyst efficiency and post-cat sensor faults, software solution for track and export cars. Honest about road use.' },
    queries: ['лямбда сонда изключване', 'катализатор премахване', 'p0420'],
    problem: {
      bg: ['Свети „чек“, грешка P0420 / P0430 „ефективност на катализатора под прага“. Или колата е с махнат катализатор от предишния собственик и втората ламбда сонда ръмжи. Или е пистова и катализаторът просто пречи.', 'Втората ламбда сонда сравнява газовете преди и след катализатора. Ако разликата е малка — катализаторът е изхабен или липсва — блокът записва грешка.'],
      en: ['Check-engine light, P0420 / P0430 “catalyst efficiency below threshold”. Or the previous owner removed the cat and the post-cat sensor complains. Or it is a track car and the catalyst is simply in the way.', 'The post-cat lambda sensor compares gases before and after the catalyst. Small difference — worn or missing catalyst — and the ECU logs a fault.'],
    },
    what: {
      bg: ['Диагностика: сигналите на двете сонди, състояние на катализатора, теч в изпускателната система. Изхабен катализатор на ежедневна кола — нов или почистен; повредена сонда — смяна.', 'За спортни, пистови и експортни автомобили — файл, в който проверката на втората сонда е изключена, за да няма грешка при махнат или спортен катализатор. Сместа и първата сонда остават да работят нормално.'],
      en: ['Diagnosis: both sensor signals, catalyst condition, exhaust leaks. Worn catalyst on a road car — replace or clean; damaged sensor — replace.', 'For motorsport, track and export cars — a file with the post-cat sensor check disabled so a removed or sports catalyst logs no fault. Mixture control and the front sensor keep working normally.'],
    },
    yes: { bg: ['спортна кола със спортен катализатор или без такъв', 'кола за писта, дрифт, драг или износ', 'стар автомобил, при който сондата е в гаранция за месец, а грешката се връща'], en: ['sports car with a sports cat or de-cat', 'track, drift, drag or export car', 'old car where the sensor keeps failing'] },
    no: { bg: ['ежедневна кола с преглед — катализаторът трябва да е там', 'грешката е от теч на изпускателната система — заварява се', 'проблемът е в първата сонда — тя не се изключва, тя се сменя'], en: ['daily road car — the catalyst must be there', 'the fault is an exhaust leak — weld it', 'the front sensor is faulty — it gets replaced, not disabled'] },
    legal: { bg: LEGAL_BG_EMISSIONS, en: LEGAL_EN_EMISSIONS },
    price: { bg: ['Диагностика — до час. Софтуерното решение — 1 до 2 часа при блок, който се чете по OBD.'], en: ['1–2 hours for ECUs that read via OBD; same-day return through the portal.'] },
    faq: {
      bg: [
        { q: 'Ще се промени ли работата на двигателя?', a: 'Не. Изключва се само проверката на втората сонда. Първата сонда, която управлява сместа, работи както досега.' },
        { q: 'Може ли с емулатор вместо софтуер?', a: 'Може, но емулаторите на втора сонда често дават грешка след няколко седмици. Софтуерното решение е окончателно.' },
        { q: 'Правите ли и махане на катализатора?', a: 'Механичната работа по изпускателната система се прави в сервиза, за автомобили извън пътя. Ние правим файла.' },
      ],
      en: [
        { q: 'Does engine behaviour change?', a: 'No. Only the post-cat sensor check is disabled. The front sensor controlling mixture works as before.' },
        { q: 'Emulator instead of software?', a: 'Possible, but post-cat emulators often log a fault after a few weeks. The software solution is final.' },
        { q: 'Which ECUs?', a: 'Bosch ME/MED/MG1, Siemens SIM/SIMOS, Denso, Delphi and most Marelli petrol ECUs. Send the read-out for confirmation.' },
      ],
    },
  },
  {
    slug: 'maf', priceKey: 'maf', fuel: 'both', legacy: 'maf-off-flow-meter',
    name: { bg: 'MAF / дебитомер', en: 'MAF / air-flow meter' },
    short: { bg: 'Дебитомерът лъже: губи мощност, пуши, грешки. Смяна или изключване.', en: 'A lying air-flow meter: lost power, smoke, faults. Replace or disable.' },
    h1: { bg: 'Дебитомер (MAF) — грешка, загуба на мощност, куц режим', en: 'MAF / air-flow meter — fault, lost power, limp mode' },
    title: { bg: 'Дебитомер Варна — грешка, смяна, изключване на MAF | PDK Tuning', en: 'MAF-off for workshops | PDK Tuning file service' },
    description: { bg: 'Дебитомер (MAF) във Варна: проверка с реални стойности, смяна с оригинален датчик или софтуерно изключване, когато блокът може да смята въздуха по MAP. Цена и време.', en: 'MAF-off file service for partner workshops: live-data check first, sensor replacement or MAF-off file where the ECU can run on the MAP model. Returned the same day.' },
    queries: ['дебитомер изключване', 'maf сензор грешка'],
    problem: {
      bg: ['Колата няма сила, задавя се при газ, пуши черно, разходът расте, грешка за дебитомера или за „смес твърде бедна“. Смяната с неоригинален датчик е помогнала за месец.', 'Дебитомерът мери колко въздух влиза в двигателя; по него блокът смята горивото. Замърсен или изхабен датчик лъже — и блокът впръсква грешно.'],
      en: ['No power, hesitation on throttle, black smoke, rising consumption, MAF or “mixture too lean” fault. A non-original replacement sensor helped for a month.', 'The MAF measures incoming air; the ECU calculates fuel from it. A dirty or worn sensor lies — and the ECU fuels wrongly.'],
    },
    what: {
      bg: ['Проверка на живо: измерен въздух срещу очакван при определени обороти. Ако датчикът е мръсен — почистване; ако е изхабен — оригинален датчик, не най-евтиният от пазара.', 'Когато оригинален датчик е много скъп или недостъпен, а блокът може да смята въздуха по MAP датчика и оборотите — файл, в който дебитомерът е изключен и калибрацията стъпва на MAP. Работи на дизели и на много бензинови двигатели.'],
      en: ['Live check: measured air against expected at set rpm. Dirty sensor — cleaning; worn sensor — genuine part, not the cheapest on the market.', 'When a genuine sensor is very expensive or unavailable and the ECU can calculate air from MAP and rpm — a file with the MAF disabled and the calibration moved to the MAP model. Works on diesels and many petrol engines.'],
    },
    yes: { bg: ['оригиналният датчик струва 400 € и се намира трудно', 'колата е с модифициран смукателен тракт и датчикът не е в калибрацията си', 'трети датчик за година и грешката се връща'], en: ['genuine sensor costs €400 and is hard to source', 'modified intake and the sensor is outside its calibration', 'third sensor in a year and the fault returns'] },
    no: { bg: ['датчикът е просто мръсен — почиства се', 'причината е подсмукване или запушен въздушен филтър', 'блокът няма MAP датчик и не може да работи без дебитомер'], en: ['the sensor is just dirty — clean it', 'the cause is an air leak or a blocked air filter', 'the ECU has no MAP sensor and cannot run without a MAF'] },
    legal: { bg: ['Изключването на дебитомера не засяга емисионните системи и няма отношение към техническия преглед, стига сместа да остане в норма — което проверяваме на стенда след записа.'], en: ['Disabling the MAF does not affect emissions systems and has no bearing on inspection as long as mixture stays within limits — which we verify on the dyno after writing.'] },
    price: { bg: ['Проверката е 30 минути. Софтуерното решение — 1–2 часа, включително проверка на сместа и пробно каране.'], en: ['1–2 hours including mixture check. Send the read-out, ECU type and a log of MAF versus MAP values if available.'] },
    faq: {
      bg: [
        { q: 'Ще има ли разлика в мощността?', a: 'При правилна калибрация — не. При много двигатели колата тръгва по-добре, защото вече не се лъже от изхабен датчик.' },
        { q: 'Може ли да се сложи универсален датчик?', a: 'Може, но повечето универсални датчици не отговарят на кривата на оригинала и проблемът се връща. Оригинал или MAF-off.' },
        { q: 'Работи ли на бензинов двигател?', a: 'На повечето с MAP датчик — да. При някои по-стари блокове без MAP не е възможно; казваме го на диагностиката.' },
      ],
      en: [
        { q: 'Any power difference?', a: 'With correct calibration — none. Many engines drive better because they are no longer fed wrong values.' },
        { q: 'Universal sensor instead?', a: 'Most universal sensors do not match the original curve and the problem returns. Genuine part or MAF-off.' },
        { q: 'Petrol engines?', a: 'Most with a MAP sensor — yes. Some older ECUs without MAP cannot; we say so before you commit.' },
      ],
    },
  },
  {
    slug: 'dtc', priceKey: 'dtc', fuel: 'both', legacy: 'dtc-off',
    name: { bg: 'DTC — изключване на грешки', en: 'DTC off' },
    short: { bg: 'Грешка, която не се маха след ремонт или след премахнат компонент.', en: 'A fault code that will not clear after a repair or a removed component.' },
    h1: { bg: 'DTC — изключване на грешка, която не е грешка', en: 'DTC off — removing a fault code that is not a fault' },
    title: { bg: 'Изключване на грешка (DTC) Варна — чек лампа | PDK Tuning', en: 'DTC off for workshops | PDK Tuning file service' },
    description: { bg: 'Свети чек лампа след ремонт или премахнат компонент? Във Варна изключваме конкретния DTC код в софтуера, след като проверим, че не крие истински проблем.', en: 'DTC-off file service for partner workshops: a specific code disabled in the ECU after we confirm it hides no real fault. Send the code list and the read-out.' },
    queries: ['изключване на грешка', 'свети чек лампа', 'dtc off'],
    problem: {
      bg: ['Свети „чек“ заради компонент, който вече го няма: втора ламбда сонда, вихрови клапи, клапан на резервоара, изпускателна клапа, датчик на спортна изпускателна система. Или след смяна на скоростна кутия остава код за модул, който колата вече не ползва.', 'Диагностичният код (DTC) е запис в блока, че нещо не отговаря на очакваното. Понякога очакваното е грешно.'],
      en: ['Check-engine light for a component that is no longer there: post-cat sensor, swirl flaps, tank valve, exhaust flap, sensor on a sports exhaust. Or after a gearbox swap a code remains for a module the car no longer uses.', 'A diagnostic trouble code is the ECU noting that something does not match expectation. Sometimes the expectation is wrong.'],
    },
    what: {
      bg: ['Първо четем всички кодове и проверяваме дали лампата не свети заради истински проблем — това е половината от работата. После изключваме точно този код в софтуера: блокът спира да го проверява, всичко останало остава.', 'Правим го по списък: кой код, защо, какво е махнато. Списъкът остава при вас.'],
      en: ['First we read all codes and verify the light is not on for a real fault — that is half the work. Then the specific code is disabled in the file: the ECU stops checking it, everything else stays.', 'Done from a list: which code, why, what was removed. Send the list with the read-out.'],
    },
    yes: { bg: ['кодът е за компонент, който е премахнат съзнателно', 'след преустройство или свап, при което модул вече не съществува', 'сервизът е сменил три пъти датчика, а причината е в проверката, не в датчика'], en: ['the code is for a deliberately removed component', 'after a conversion or swap where a module no longer exists', 'the sensor was replaced three times and the cause is the check, not the sensor'] },
    no: { bg: ['кодът е за спирачки, въздушна възглавница, кормилно или всичко, свързано с безопасност — не пипаме', 'кодът е за емисионна система на кола за път', 'лампата свети заради истински проблем, който трябва да се оправи'], en: ['codes for brakes, airbags, steering or anything safety-related — we do not touch them', 'emissions code on a road car', 'the light is on for a real fault that needs fixing'] },
    legal: { bg: ['Кодове, свързани с безопасността (ABS, ESP, въздушни възглавници, кормилно управление), не се изключват при никакви условия. Кодове от емисионните системи се изключват само при условията от страниците за DPF и EGR.'], en: ['Safety-related codes (ABS, ESP, airbags, steering) are never disabled. Emissions-related codes only under the conditions described on the DPF and EGR pages.'] },
    price: { bg: ['Цената е за първия код; всеки следващ в същия файл е по-евтин. Времето — около час при блок, който се чете по OBD.'], en: ['Priced per first code; each further code in the same file is cheaper. About an hour for OBD-readable ECUs.'] },
    faq: {
      bg: [
        { q: 'Може ли просто да се изтрие грешката?', a: 'Изтриването трае до следващото запалване. Изключването в софтуера е окончателно, защото блокът вече не проверява това условие.' },
        { q: 'Ще се види ли при преглед?', a: 'Диагностичният тест при преглед чете активни кодове. Ако кодът е изключен и лампата не свети, няма код. Това не важи за емисионните кодове на коли за път — виж по-горе.' },
        { q: 'Кои кодове не пипате?', a: 'Всичко по спирачки, възглавници, кормилно, колани и ключалки. Точка.' },
      ],
      en: [
        { q: 'Can the code just be cleared?', a: 'Clearing lasts until the next ignition cycle. Disabling in the file is final because the ECU no longer checks that condition.' },
        { q: 'What do you need?', a: 'Full read-out, ECU type, the list of codes with a note of what was removed and why.' },
        { q: 'Which codes do you refuse?', a: 'Anything on brakes, airbags, steering, belts and locks. Full stop.' },
      ],
    },
  },
  {
    slug: 'v-max', priceKey: 'v-max', fuel: 'both', legacy: 'v-max',
    name: { bg: 'V-MAX ограничител', en: 'V-MAX limiter' },
    short: { bg: 'Сваляне на електронния ограничител на скоростта — за писта и извън пътя.', en: 'Removing the electronic speed limiter — for track use.' },
    h1: { bg: 'V-MAX — сваляне на ограничителя на скоростта', en: 'V-MAX — removing the speed limiter' },
    title: { bg: 'Сваляне на ограничител на скоростта (V-MAX) Варна | PDK Tuning', en: 'V-MAX limiter removal for workshops | PDK Tuning' },
    description: { bg: 'Електронен ограничител на скоростта (250 км/ч при BMW, Mercedes, Audi; 180–210 при японски модели): сваляне за пистова употреба във Варна. Условия за гумите.', en: 'V-MAX file service for partner workshops: electronic speed limiter removed (250 km/h German premium, 180–210 Japanese models) for track use. Tyre conditions apply.' },
    queries: ['сваляне на ограничител на скоростта', 'v-max'],
    problem: {
      bg: ['Колата спира да ускорява на 250 км/ч (BMW, Mercedes, Audi, Porsche без пакет), на 210 или на 180 (японски пазар), при ванове и пикапи — на 160. Ограничението е чисто софтуерно.', 'Производителят го слага заради гумите, с които колата се продава, и заради застрахователните класове на някои пазари.'],
      en: ['The car stops accelerating at 250 km/h (BMW, Mercedes, Audi, Porsche without the package), at 210 or 180 (Japanese market), at 160 on vans and pick-ups. The limit is purely software.', 'Manufacturers set it for the tyres the car is sold with and for insurance classes in some markets.'],
    },
    what: {
      bg: ['Сваляме или вдигаме ограничителя в софтуера на двигателя — при някои модели и в блока на скоростната кутия. Правим го заедно с проверка на гумите: индексът на скоростта трябва да покрива новата максимална скорост, иначе не работим.', 'При японски модели с ограничение 180 км/ч често се комбинира с корекция на скоростомера.'],
      en: ['The limiter is removed or raised in the engine ECU — on some models also in the gearbox module. Tyre speed rating must cover the new top speed; the workshop confirms it before we write.', 'On 180 km/h JDM models often combined with speedometer correction.'],
    },
    yes: { bg: ['кола за писта, трак дни или състезания', 'кола с гуми с индекс Y или (Y) и подходящи спирачки', 'внос от Япония с ограничение 180 км/ч и грешен скоростомер'], en: ['track, track-day or racing car', 'car on Y or (Y) rated tyres with adequate brakes', 'JDM import limited to 180 km/h with a wrong speedometer'] },
    no: { bg: ['гуми с индекс под W — не', 'ван или пикап с ограничение заради товара', 'кола, при която ограничението е механично или в друг модул, който не пипаме'], en: ['tyres rated below W — no', 'van or pick-up limited because of load', 'car where the limit is mechanical or in a module we do not touch'] },
    legal: { bg: ['Максималната разрешена скорост по пътищата в България е 140 км/ч. Свалянето на ограничителя е за пистова и състезателна употреба; на пътя отговорността за спазване на ограниченията е изцяло на водача.'], en: ['The legal maximum on Bulgarian roads is 140 km/h. Limiter removal is for track and competition use; on the road the driver alone is responsible for observing speed limits.'] },
    price: { bg: ['Около час при блок, който се чете по OBD. Ако се комбинира с чип тунинг, влиза в цената на файла.'], en: ['About an hour for OBD-readable ECUs. Combined with a Stage 1 file it is included in the file price.'] },
    faq: {
      bg: [
        { q: 'Колко ще вдигне колата след свалянето?', a: 'Колкото ѝ позволяват мощността и предавките. Числото зависи от модела; казваме го преди работа, не след.' },
        { q: 'Може ли ограничителят да се вдигне, а не да се махне?', a: 'Да — например на 280 вместо на „без“. Това е разумното решение за повечето коли.' },
        { q: 'Влияе ли на гаранцията?', a: 'Всяка промяна в софтуера е основание за отказ на гаранция от производителя. При кола в гаранция не препоръчваме.' },
      ],
      en: [
        { q: 'What will the car reach?', a: 'Whatever power and gearing allow. The figure depends on the model; we say it before the work, not after.' },
        { q: 'Raise instead of remove?', a: 'Yes — 280 instead of “none”, for example. The sensible option for most cars.' },
        { q: 'Warranty?', a: 'Any software change is grounds for a manufacturer to refuse warranty. Not recommended on a car under warranty.' },
      ],
    },
  },
];
export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
