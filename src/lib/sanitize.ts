const DANGEROUS_TAGS = /<\/?(script|iframe|object|embed|form|input|style|link|meta|base|applet|frame|frameset|on\w+)[^>]*>/gi;

export function sanitizeHtml(html: string): string {
  return html.replace(DANGEROUS_TAGS, '');
}

export function markdownToSafeHtml(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold text-white mt-3 mb-1">$1</h3>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-slate-600 pl-3 italic text-slate-400">$1</blockquote>');

  return sanitizeHtml(html);
}
