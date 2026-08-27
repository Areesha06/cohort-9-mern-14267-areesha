const EXPORT_VERSION = 1;

export const buildExportFile = (notes) => {
  const exportData = {
    app: 'AniNotes',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    notes: notes.map((note) => ({
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    })),
  };
  return JSON.stringify(exportData, null, 2);
};

export const downloadExportFile = (notes) => {
  const json = buildExportFile(notes);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().slice(0, 10);

  const link = document.createElement('a');
  link.href = url;
  link.download = `aninotes-export-${dateStamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read file "${file.name}"`));
    reader.readAsText(file);
  });

const extractNotesFromParsedJson = (parsed) => {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.notes)) return parsed.notes;
  if (parsed && typeof parsed === 'object') return [parsed];
  return [];
};

const isValidNoteEntry = (entry) =>
  entry &&
  typeof entry === 'object' &&
  typeof entry.title === 'string' && entry.title.trim().length > 0 &&
  typeof entry.content === 'string' && entry.content.trim().length > 0;

export const parseImportFiles = async (files) => {
  const validNotes = [];
  const errors = [];

  for (const file of files) {
    let text;
    try {
      text = await readFileAsText(file);
    } catch {
      errors.push({ file: file.name, message: 'Could not read this file.' });
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      errors.push({ file: file.name, message: 'This file is not valid JSON.' });
      continue;
    }

    const entries = extractNotesFromParsedJson(parsed);

    if (entries.length === 0) {
      errors.push({ file: file.name, message: 'No notes found in this file.' });
      continue;
    }

    entries.forEach((entry, index) => {
      if (isValidNoteEntry(entry)) {
        validNotes.push({ title: entry.title.trim(), content: entry.content, sourceFile: file.name });
      } else {
        errors.push({ file: file.name, message: `Note ${index + 1} is missing a title or content and was skipped.` });
      }
    });
  }

  return { validNotes, errors };
};
