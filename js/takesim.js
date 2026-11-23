(() => {
  const meetingTabs = [...document.querySelectorAll('.meeting-pages button')];
  const meetingNotes = document.querySelectorAll('.meeting-notes article');
  const meeting = document.querySelector('#takesim');
  const clubLink = meeting.querySelector('.meeting-club-link');
  const compactMeeting = matchMedia('(max-width: 1000px), (max-height: 700px)');
  let doorTimer;
  let noteTimer;
  const noteDuration = 12000;
  function updateMeetingDoor() {
    if (location.hash === '#takesim' && meeting.classList.contains('door-open')) return;
    clearTimeout(doorTimer);
    if (location.hash !== '#takesim') {
      meeting.classList.remove('door-open');
      clubLink.setAttribute('hidden', '');
      clubLink.removeAttribute('href');
      return;
    }
    if (compactMeeting.matches && !meetingNotes[2].classList.contains('selected')) return;
    doorTimer = setTimeout(() => {
      meeting.classList.add('door-open');
      doorTimer = setTimeout(() => {
        clubLink.removeAttribute('hidden');
        clubLink.setAttribute('href', '#papara');
      }, 650);
    }, compactMeeting.matches ? noteDuration : 3900);
  }
  function selectNote(index) {
    clearTimeout(noteTimer);
    meetingTabs.forEach((tab, i) => tab.setAttribute('aria-pressed', i === index));
    meetingNotes.forEach((note, i) => note.classList.toggle('selected', i === index));
    updateMeetingDoor();
    if (location.hash === '#takesim' && compactMeeting.matches && index < meetingNotes.length - 1) {
      noteTimer = setTimeout(() => selectNote(index + 1), noteDuration);
    }
  }
  meetingTabs.forEach((button, index) => {
    button.addEventListener('click', () => selectNote(index));
  });
  function enterMeeting() {
    clearTimeout(noteTimer);
    if (location.hash === '#takesim') selectNote(0);
    else updateMeetingDoor();
  }
  window.addEventListener('hashchange', enterMeeting);
  compactMeeting.addEventListener('change', enterMeeting);
  enterMeeting();
})();
