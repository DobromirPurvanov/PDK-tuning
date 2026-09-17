/**
 * Кои редове в един файл са ПРОЗА, а не код.
 *
 * Ползва се и от `check-hardcoded.mjs`, и от `check-tokens.mjs`: и двата търсят
 * низове, които в коментар ОБЯСНЯВАТ нещо, а в код го ПРАВЯТ. Едната проверка
 * гледа домейн, другата — цвят, но въпросът „това ред код ли е“ е един и същ.
 *
 * Първата версия гледаше само началото на реда и пропускаше продълженията на
 * блоковите коментари — ред без звездичка насред `{/* … *\/}` изглеждаше като код
 * и вдигаше фалшива тревога на четири места. Затова състоянието „вътре в блоков
 * коментар“ се носи през файла, вместо да се гадае по един ред.
 */
export function proseLines(text) {
  const out = new Set();
  let inBlock = false;
  text.split('\n').forEach((line, n) => {
    const t = line.trim();
    const opens = line.lastIndexOf('/*');
    const closes = line.lastIndexOf('*/');
    const wasInBlock = inBlock;
    if (!inBlock && opens >= 0 && closes < opens) inBlock = true;
    else if (inBlock && closes >= 0) inBlock = false;
    if (wasInBlock || inBlock || t.startsWith('//') || t.startsWith('#')
        || t.startsWith('*') || /"_[a-z_]+":/.test(t)) out.add(n);
  });
  return out;
}
