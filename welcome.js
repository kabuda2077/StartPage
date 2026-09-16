/* First-visit flow is independent of settings and weather requests. */
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
let welcomeFinishing = false;
async function finishWelcome(name, skipGreeting = false) {
  if (welcomeFinishing) return;
  welcomeFinishing = true;
  appStorage.setItem('userName', name);
  appStorage.setItem('hasVisited', 'true');
  updateGreeting(); renderUsernameSection();
  const overlay = document.getElementById('welcome-overlay');
  const inputContainer = document.getElementById('welcome-input-container');
  const greetingContainer = document.getElementById('welcome-greeting-container');
  const reduced = reducedMotionQuery.matches;
  inputContainer.style.opacity = '0';
  inputContainer.style.transform = 'translateY(-30px)';
  await delay(reduced ? 0 : 500);
  inputContainer.style.display = 'none';
  if (!skipGreeting) {
    document.getElementById('welcome-greeting-text').textContent = greeting.textContent;
    greetingContainer.style.opacity = '1';
    greetingContainer.style.transform = 'translateY(0)';
    await delay(1500);
    greetingContainer.style.opacity = '0';
    greetingContainer.style.transform = 'translateY(-30px)';
    await delay(reduced ? 0 : 400);
  }
  overlay.style.opacity = '0';
  document.documentElement.classList.add('do-reveal');
  document.documentElement.classList.remove('is-first-visit');
  await delay(reduced ? 0 : 800);
  overlay.style.display = 'none';
  searchInput.focus();
  document.getElementById('floating-controls').classList.add('is-discoverable');
  setTimeout(() => document.getElementById('floating-controls').classList.remove('is-discoverable'), 6000);
  await delay(reduced ? 0 : 500);
  document.documentElement.classList.remove('do-reveal');
}
function handleFirstVisit() {
  if (appStorage.getItem('hasVisited')) return;
  const overlay = document.getElementById('welcome-overlay');
  const input = document.getElementById('welcome-name-input');
  const skip = document.getElementById('welcome-skip');
  overlay.style.display = 'flex';
  setTimeout(() => input.focus(), 0);
  skip.textContent = t('welcomeSkip');
  input.onkeydown = e => {
    if (e.isComposing) return;
    if (e.key === 'Enter') finishWelcome(input.value.trim());
    if (e.key === 'Escape') finishWelcome('', true);
  };
  skip.onclick = () => finishWelcome('', true);
}
