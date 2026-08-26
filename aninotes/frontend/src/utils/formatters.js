import DOMPurify from 'dompurify';

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const stripHtml = (html) => {
  if (!html) return '';

  const withSpacing = html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '$& ')
    .replace(/<br\s*\/?>/gi, ' ');

  const temp = document.createElement('div');
  temp.innerHTML = withSpacing;

  return (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
};

export const getContentPreview = (content, maxLength = 120) => {
  const plainText = stripHtml(content);
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trim()}…`;
};

export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 'blockquote', 'b', 'i'],
    ALLOWED_ATTR: [],
  });
};
