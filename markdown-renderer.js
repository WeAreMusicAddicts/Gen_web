// Universal Offline Markdown Renderer with Code Blocks and Callouts
(function(window) {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMarkdown(md) {
    if (!md || typeof md !== 'string') return '';
    let text = md.trim();
    if (!text) return '';

    // 1. Code blocks ```lang\ncode\n```
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, function(match, lang, code) {
      const idx = codeBlocks.length;
      const trimmedCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      const cleanCode = escapeHtml(trimmedCode);
      const label = lang ? lang.toUpperCase() : 'КОМАНДЫ / КОНФИГ';
      codeBlocks.push(
        `<div class="code-block-wrapper">` +
          `<div class="code-block-header">` +
            `<span><i class="fas fa-terminal"></i> ${escapeHtml(label)}</span>` +
            `<button type="button" class="btn-copy-code" data-code="${escapeHtml(trimmedCode)}"><i class="far fa-copy"></i> Копировать</button>` +
          `</div>` +
          `<pre><code>${cleanCode}</code></pre>` +
        `</div>`
      );
      return `\n\n__CODE_BLOCK_${idx}__\n\n`;
    });

    // 2. Headings #, ##, ###, ####
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 3. Alerts / Callouts: > ⚠️, > 💡, > ℹ️, or regular blockquote
    text = text.replace(/^>\s*(?:⚠️|\[!WARNING\]|Внимание:?)\s*(.*$)/gim, 
      '<div class="note-alert note-alert-warning"><i class="fas fa-exclamation-triangle"></i><div><strong>Внимание:</strong> $1</div></div>');
    text = text.replace(/^>\s*(?:💡|\[!TIP\]|Совет:?|Памятка:?)\s*(.*$)/gim, 
      '<div class="note-alert note-alert-tip"><i class="fas fa-lightbulb"></i><div><strong>Совет:</strong> $1</div></div>');
    text = text.replace(/^>\s*(?:ℹ️|\[!NOTE\]|Инфо:?)\s*(.*$)/gim, 
      '<div class="note-alert note-alert-info"><i class="fas fa-info-circle"></i><div><strong>Информация:</strong> $1</div></div>');
    text = text.replace(/^>\s*(.*$)/gim, '<blockquote>$1</blockquote>');

    // 4. Tables:
    text = text.replace(/((?:\|[^\n]+\|\r?\n)+)/g, function(tableMatch) {
      const rows = tableMatch.trim().split(/\r?\n/).map(r => r.trim()).filter(Boolean);
      if (rows.length < 2) return tableMatch;
      let html = '<table>';
      let isHeader = true;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.match(/^\|(?:\s*:?-+:?\s*\|)+$/)) {
          isHeader = false; // divider row
          continue;
        }
        const cells = row.split('|').slice(1, -1).map(c => c.trim());
        if (!cells.length) continue;
        html += '<tr>';
        cells.forEach(cell => {
          html += isHeader ? `<th>${cell}</th>` : `<td>${cell}</td>`;
        });
        html += '</tr>';
        if (isHeader) isHeader = false;
      }
      html += '</table>';
      return html;
    });

    // 5. Bold & Italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 6. Inline code `code`
    text = text.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

    // 7. Unordered lists: - item or * item
    text = text.replace(/(?:^|\n)(?:[-*]\s+.*(?:\n(?:[-*]\s+.*)*))/g, function(match) {
      const items = match.trim().split(/\n/).map(line => {
        const itemText = line.replace(/^[-*]\s+/, '').trim();
        return `<li>${itemText}</li>`;
      }).join('');
      return `\n<ul>${items}</ul>\n`;
    });

    // 8. Ordered lists: 1. item
    text = text.replace(/(?:^|\n)(?:\d+\.\s+.*(?:\n(?:\d+\.\s+.*)*))/g, function(match) {
      const items = match.trim().split(/\n/).map(line => {
        const itemText = line.replace(/^\d+\.\s+/, '').trim();
        return `<li>${itemText}</li>`;
      }).join('');
      return `\n<ol>${items}</ol>\n`;
    });

    // 9. Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // 10. Paragraphs & Linebreaks
    const paragraphs = text.split(/\n\n+/);
    text = paragraphs.map(para => {
      para = para.trim();
      if (!para) return '';
      if (para.match(/^<(div|table|ul|ol|h1|h2|h3|h4|blockquote)/i) || para.startsWith('__CODE_BLOCK_')) {
        return para;
      }
      return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    // 11. Restore Code Blocks
    text = text.replace(/__CODE_BLOCK_(\d+)__/g, function(m, id) {
      return codeBlocks[Number(id)] || '';
    });

    return text;
  }

  function bindCopyButtons(container) {
    if (!container) return;
    container.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        const code = btn.getAttribute('data-code') || '';
        navigator.clipboard.writeText(code).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check" style="color: #34d399;"></i> Скопировано';
          btn.style.borderColor = 'rgba(52, 211, 153, 0.4)';
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.borderColor = '';
          }, 2000);
        }).catch(err => {
          console.error('Не удалось скопировать:', err);
        });
      };
    });
  }

  window.MarkdownRenderer = {
    render: renderMarkdown,
    bindCopyButtons: bindCopyButtons,
    escapeHtml: escapeHtml
  };
})(window);
