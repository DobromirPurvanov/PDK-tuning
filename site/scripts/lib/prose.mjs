/**
 * Which lines in a file are PROSE, not code.
 *
 * Used by both `check-hardcoded.mjs` and `check-tokens.mjs`: both look for
 * strings that EXPLAIN something in a comment and DO it in code. One check
 * looks at a domain, the other at a colour, but the question "is this a line
 * of code" is the same.
 *
 * The first version only looked at the start of the line and missed the
 * continuations of block comments: a line without an asterisk in the middle of
 * `{/* … *\/}` looked like code and raised a false alarm in four places.
 * That is why the "inside a block comment" state is carried through the file
 * instead of being guessed from a single line.
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
