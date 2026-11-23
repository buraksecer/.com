(() => {
  const meeting = document.querySelector('#takesim');
  const tabs = [...meeting.querySelectorAll('.meeting-pages button')];
  const notes = [...meeting.querySelectorAll('.meeting-notes article')];
  const paragraphs = notes.map(note => [...note.querySelectorAll('p')].map(paragraph => {
    const text = paragraph.textContent;
    const visible = document.createTextNode('');
    const remaining = document.createElement('span');
    remaining.style.visibility = 'hidden';
    remaining.setAttribute('aria-hidden', 'true');
    paragraph.replaceChildren(visible, remaining);
    return { text, visible, remaining };
  }));
  const clubLink = meeting.querySelector('.meeting-club-link');
  const compact = matchMedia('(max-width: 1000px), (max-height: 700px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let timer;
  let doorTimer;

  function reveal(group, count) {
    group.forEach(({ text, visible, remaining }) => {
      visible.data = text.slice(0, count);
      remaining.textContent = text.slice(count);
      count = Math.max(0, count - text.length);
    });
  }

  function selectNote(index) {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', i === index));
    notes.forEach((note, i) => note.classList.toggle('selected', i === index));
    paragraphs.forEach((group, i) => reveal(group, i < index ? Infinity : 0));

    const group = paragraphs[index];
    const length = group.reduce((total, paragraph) => total + paragraph.text.length, 0);
    const start = performance.now();

    function type(now) {
      const count = reducedMotion.matches ? length : Math.min(length, Math.floor((now - start) / 22));
      reveal(group, count);
      if (count < length) {
        frame = requestAnimationFrame(type);
        return;
      }
      if (index < notes.length - 1) {
        timer = setTimeout(() => selectNote(index + 1), compact.matches ? 3200 : 500);
        return;
      }
      meeting.classList.add('door-open');
      doorTimer = setTimeout(() => {
        clubLink.setAttribute('href', '#papara');
        clubLink.removeAttribute('hidden');
      }, reducedMotion.matches ? 0 : 650);
    }

    frame = requestAnimationFrame(type);
  }

  function enterMeeting() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    clearTimeout(doorTimer);
    meeting.classList.remove('door-open');
    clubLink.setAttribute('hidden', '');
    clubLink.removeAttribute('href');
    if (location.hash === '#takesim') selectNote(0);
  }

  tabs.forEach((button, index) => button.addEventListener('click', () => selectNote(index)));
  window.addEventListener('hashchange', enterMeeting);
  enterMeeting();
})();
