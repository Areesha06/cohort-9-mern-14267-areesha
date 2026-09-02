import { buildNoteTxt, parseImportFiles } from './notesTransfer';

const makeTxtFile = (name, text) => new File([text], name, { type: 'text/plain' });

describe('buildNoteTxt', () => {
  it('starts with the title, then a blank line, then the plain-text content', () => {
    const note = { title: 'Grocery List', content: '<p>Milk</p><p>Eggs</p>' };
    const text = buildNoteTxt(note);
    const lines = text.split('\n');

    expect(lines[0]).toBe('Grocery List');
    expect(lines[1]).toBe('');
    expect(text).toContain('Milk');
    expect(text).toContain('Eggs');
  });

  it('converts bullet list items into "- " prefixed lines', () => {
    const note = { title: 'Todo', content: '<ul><li>First</li><li>Second</li></ul>' };
    const text = buildNoteTxt(note);

    expect(text).toContain('- First');
    expect(text).toContain('- Second');
  });
});

describe('parseImportFiles', () => {
  it('uses the first line as the title and the rest as content', async () => {
    const file = makeTxtFile('note.txt', 'My Title\n\nSome content here.');
    const { validNotes, errors } = await parseImportFiles([file]);

    expect(errors).toHaveLength(0);
    expect(validNotes[0].title).toBe('My Title');
    expect(validNotes[0].content).toContain('Some content here.');
  });

  it('falls back to the filename as the title for a single-line file', async () => {
    const file = makeTxtFile('Quick-Reminder.txt', 'Buy milk on the way home.');
    const { validNotes } = await parseImportFiles([file]);

    expect(validNotes[0].title).toBe('Quick Reminder');
    expect(validNotes[0].content).toContain('Buy milk on the way home.');
  });

  it('imports multiple selected .txt files as separate notes', async () => {
    const fileA = makeTxtFile('a.txt', 'Note A\n\nContent A');
    const fileB = makeTxtFile('b.txt', 'Note B\n\nContent B');

    const { validNotes } = await parseImportFiles([fileA, fileB]);

    expect(validNotes).toHaveLength(2);
    expect(validNotes.map((n) => n.title)).toEqual(['Note A', 'Note B']);
  });

  it('reports an error for a completely empty file', async () => {
    const file = makeTxtFile('empty.txt', '   ');
    const { validNotes, errors } = await parseImportFiles([file]);

    expect(validNotes).toHaveLength(0);
    expect(errors[0].file).toBe('empty.txt');
  });

  it('escapes HTML-like characters found in imported plain text', async () => {
    const file = makeTxtFile('note.txt', 'Title\n\n<script>alert(1)</script>');
    const { validNotes } = await parseImportFiles([file]);

    expect(validNotes[0].content).not.toContain('<script>');
    expect(validNotes[0].content).toContain('&lt;script&gt;');
  });
});
