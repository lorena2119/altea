import './styles/main.css';
import { initUploader } from './ui/uploader.js';
initUploader();

const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('[data-nav]');

function showView(id) {
  views.forEach((v) => v.classList.toggle('is-active', v.id === id));
  navLinks.forEach((a) => a.classList.toggle('is-current', a.dataset.nav === id));
  window.scrollTo({ top: 0 });
}

document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-go]');
  if (!target) return;
  e.preventDefault();
  showView(target.dataset.go);
});