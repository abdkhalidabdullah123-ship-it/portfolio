/* ==========================================
   PROJECT DETAILS — NIGHT MODE / COPY COMMAND
========================================== */
const toggle = document.getElementById('themeToggle');
const root = document.documentElement;
function updateToggle() {
    const dark = root.classList.contains('dark-mode');
    toggle.textContent = dark ? '☀' : '☾';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Enable light mode' : 'Enable night mode');
}
if (toggle) {
    updateToggle();
    toggle.addEventListener('click', () => {
        root.classList.toggle('dark-mode');
        try { localStorage.setItem('portfolio-theme', root.classList.contains('dark-mode') ? 'dark' : 'light'); } catch (e) {}
        updateToggle();
    });
}
const copy = document.getElementById('copyCommand');
if (copy) copy.addEventListener('click', async () => {
    const command = document.querySelector('.terminal code').textContent;
    try { await navigator.clipboard.writeText(command); copy.textContent='COPIED!'; }
    catch (e) { copy.textContent='SELECT TEXT'; }
    setTimeout(() => { copy.textContent='COPY'; }, 1800);
});
