// GPON Generator - Module Loader
// Сохраняет поддержку type="module", загружая основную (main.js) версию.

const script = document.createElement('script');
script.src = './main.js';
script.defer = true;
document.head.appendChild(script);
