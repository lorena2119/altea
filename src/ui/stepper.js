// Indicador de pasos: 1 Foto, 2 Análisis facial, 3 Colorimetría, 4 Resultados.
// Los pasos anteriores al actual se marcan como hechos (✓).
export function setStep(n) {
  document.querySelectorAll('.stepper li').forEach((li, i) => {
    const step = i + 1;
    li.classList.toggle('is-done', step < n);
    li.classList.toggle('is-active', step === n);
    li.querySelector('span').textContent = step < n ? '✓' : String(step);
  });
}