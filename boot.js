(() => {
  const root = document.documentElement;
  if (!localStorage.getItem('hasVisited')) root.classList.add('is-first-visit');
  if (localStorage.getItem('theme') === 'dark') root.classList.add('dark-mode');
})();
