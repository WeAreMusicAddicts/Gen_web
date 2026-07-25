(function (global) {
  function renderTemplate(tpl, vars) {
    if (!tpl) return '';
    const port = vars.port || vars.ontId || '';
    const parts = String(port).split('/').filter(Boolean);

    const derived = {
      ...vars,
      slot: vars.slot || parts[0] || port || '0',
      portNum: vars.portNum || parts[1] || '1',
      subslot: vars.subslot || parts[1] || '0',
      portPath: parts.length >= 2 ? `${parts[0]}-${parts[1]}` : port,
      frameSlot: parts.length >= 3 ? `${parts[0]}/${parts[1]}` : (parts[0] || '0/0'),
      gponPort: port,
      ontIdx: parts.length >= 3 ? parts[2] : (parts[1] || '1')
    };

    let lines = String(tpl).split('\n');
    let resultLines = [];

    for (let line of lines) {
      // Check conditional {if varName} ... {/if}
      let conditionalMatch = line.match(/^\{if\s+(!?)(\w+)\}(.*)\{\/if\}$/);
      if (conditionalMatch) {
        const isNot = conditionalMatch[1] === '!';
        const varName = conditionalMatch[2];
        const content = conditionalMatch[3];
        const val = derived[varName];

        let isTruthy = Boolean(val && val !== 'false' && val !== '0');
        if (isNot) isTruthy = !isTruthy;

        if (isTruthy) {
          line = content;
        } else {
          continue; // skip line
        }
      }

      // Replace placeholders {varName}
      let renderedLine = line.replace(/\{(\w+)\}/g, (match, key) => {
        if (key in derived) {
          return derived[key] !== undefined && derived[key] !== null ? derived[key] : '';
        }
        return match;
      });

      resultLines.push(renderedLine);
    }

    return resultLines.join('\n');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderTemplate };
  } else {
    global.TemplateEngine = { renderTemplate };
  }
})(typeof window !== 'undefined' ? window : this);
