import { formatDate, stripHtml, getContentPreview } from './formatters';

describe('formatDate', () => {
  it('formats an ISO date string into a readable date', () => {
    const result = formatDate('2026-01-15T10:00:00.000Z');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2026/);
  });
});

describe('stripHtml', () => {
  it('removes tags and keeps the text', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('inserts spacing between block elements so words do not glue together', () => {
    expect(stripHtml('<p>Hello</p><p>World</p>')).toBe('Hello World');
  });

  it('converts <br> tags into spaces', () => {
    expect(stripHtml('Line one<br>Line two')).toBe('Line one Line two');
  });

  it('returns an empty string for empty or null input', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(null)).toBe('');
  });

  it("treats Quill's empty editor markup as empty", () => {
    expect(stripHtml('<p><br></p>')).toBe('');
  });
});

describe('getContentPreview', () => {
  it('returns the full text when shorter than the max length', () => {
    expect(getContentPreview('<p>Short note</p>', 50)).toBe('Short note');
  });

  it('truncates and appends an ellipsis when longer than the max length', () => {
    const longText = `<p>${'a'.repeat(200)}</p>`;
    const preview = getContentPreview(longText, 20);
    expect(preview.length).toBe(21); 
    expect(preview.endsWith('…')).toBe(true);
  });
});
