export const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read file "${file.name}"`));
    reader.readAsText(file);
  });

const htmlToPlainText = (html) => {
  if (!html) return '';

  const withBreaks = html
    .replace(/<\/(p|div|h[1-6]|blockquote)>/gi, '$&\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n');

  const temp = document.createElement('div');
  temp.innerHTML = withBreaks;

  const text = temp.textContent || temp.innerText || '';
  return text.replace(/\n{3,}/g, '\n\n').trim();
};

const sanitizeFilename = (title) => {
  const cleaned = title
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return cleaned.slice(0, 60) || 'note';
};

export const buildNoteTxt = (note) => {
  const plainContent = htmlToPlainText(note.content);
  return `${note.title}\n\n${plainContent}\n`;
};

const downloadTextFile = (filename, text) => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadNotesAsTxtFiles = async (notes) => {
  for (let i = 0; i < notes.length; i += 1) {
    const note = notes[i];
    downloadTextFile(`${sanitizeFilename(note.title)}.txt`, buildNoteTxt(note));
    if (i < notes.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
};

const escapeHtmlChars = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const plainTextToHtml = (text) =>
  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtmlChars(line)}</p>`)
    .join('');

const fallbackTitleFromFilename = (filename) => {
  const withoutExtension = filename.replace(/\.txt$/i, '');
  const spaced = withoutExtension.replace(/[-_]+/g, ' ').trim();
  return spaced || 'Imported note';
};

const parseNoteTxt = (text, filename) => {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return null;

  const lines = normalized.split('\n');
  const firstLine = lines[0].trim();
  const rest = lines.slice(1).join('\n').trim();

  if (rest) {
    return {
      title: firstLine || fallbackTitleFromFilename(filename),
      content: plainTextToHtml(rest),
    };
  }

  return {
    title: fallbackTitleFromFilename(filename),
    content: plainTextToHtml(firstLine),
  };
};

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

    const note = parseNoteTxt(text, file.name);

    if (!note) {
      errors.push({ file: file.name, message: 'This file is empty.' });
      continue;
    }

    validNotes.push({ ...note, sourceFile: file.name });
  }

  return { validNotes, errors };
};
