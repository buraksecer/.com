const languagePicker = document.querySelector('.language');
const languageButtons = languagePicker.querySelectorAll('button');
const menu = document.querySelector('.welcome nav');
const links = [...menu.querySelectorAll('a[data-en]')].map(link => ({
  link,
  href: link.getAttribute('href'),
  tr: link.textContent,
  en: link.dataset.en
}));

function setLanguage(language) {
  const english = language === 'en';
  document.documentElement.lang = language;
  document.title = english ? 'Burak Seçer — Portfolio' : 'Burak Seçer — Portfolyo';
  menu.setAttribute('aria-label', english ? 'Portfolio menu' : 'Portfolyo seçimi');
  languagePicker.setAttribute('aria-label', english ? 'Language' : 'Dil');
  languageButtons.forEach(button => button.setAttribute('aria-pressed', button.lang === language));
  links.forEach(labels => { labels.link.textContent = labels[language]; labels.link.href = english ? 'en/' + labels.href : labels.href; });
}

languageButtons.forEach(button => {
  button.addEventListener('click', () => {
    setLanguage(button.lang);
    try { sessionStorage.setItem('menu-language', button.lang); } catch {}
  });
});

try {
  if (sessionStorage.getItem('menu-language') === 'en') setLanguage('en');
} catch {}
