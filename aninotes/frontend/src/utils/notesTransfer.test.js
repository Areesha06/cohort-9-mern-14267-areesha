import { buildExportFile, parseImportFiles } from './notesTransfer';

const makeJsonFile = (name, content) => new File([JSON.stringify(content)], name, { type: 'application/json' });

describe('buildExportFile', () => {
  it('wraps notes in an export envelope with app name and version', () => {
    const notes = [{ title: 'A', content: '<p>a</p>', createdAt: '2026-01-01', updatedAt: '2026-01-02' }];
    const json = JSON.parse(buildExportFile(notes));

    expect(json.app).toBe('AniNotes');
    expect(json.notes).toHaveLength(1);
    expect(json.notes[0].title).toBe('A');
  });
});

describe('parseImportFiles', () => {
  it('parses a single AniNotes export file containing multiple notes', async () => {
    const file = makeJsonFile('export.json', {
      app: 'AniNotes',
      notes: [{ title: 'First', content: '<p>one</p>' }, { title: 'Second', content: '<p>two</p>' }],
    });

    const { validNotes, errors } = await parseImportFiles([file]);

    expect(validNotes).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it('parses a plain array of notes', async () => {
    const file = makeJsonFile('notes.json', [{ title: 'X', content: '<p>y</p>' }]);
    const { validNotes } = await parseImportFiles([file]);
    expect(validNotes).toHaveLength(1);
  });

  it('parses a single note object not wrapped in an array', async () => {
    const file = makeJsonFile('single.json', { title: 'Solo', content: '<p>note</p>' });
    const { validNotes } = await parseImportFiles([file]);
    expect(validNotes).toHaveLength(1);
    expect(validNotes[0].title).toBe('Solo');
  });

  it('combines valid notes from multiple files into one list', async () => {
    const fileA = makeJsonFile('a.json', [{ title: 'A1', content: '<p>a1</p>' }]);
    const fileB = makeJsonFile('b.json', [{ title: 'B1', content: '<p>b1</p>' }]);

    const { validNotes } = await parseImportFiles([fileA, fileB]);
    expect(validNotes).toHaveLength(2);
  });

  it('reports an error for invalid JSON without failing the whole batch', async () => {
    const badFile = new File(['not json'], 'bad.json', { type: 'application/json' });
    const goodFile = makeJsonFile('good.json', [{ title: 'Good', content: '<p>g</p>' }]);

    const { validNotes, errors } = await parseImportFiles([badFile, goodFile]);

    expect(validNotes).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].file).toBe('bad.json');
  });

  it('skips individual notes missing a title or content', async () => {
    const file = makeJsonFile('mixed.json', [
      { title: 'Has both', content: '<p>ok</p>' },
      { title: '', content: '<p>no title</p>' },
      { title: 'No content', content: '' },
    ]);

    const { validNotes, errors } = await parseImportFiles([file]);

    expect(validNotes).toHaveLength(1);
    expect(errors).toHaveLength(2);
  });
});
