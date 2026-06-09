export function parallaxHero() {
  const background = document.querySelector('.background')

  window.addEventListener('scroll', () => {
    let value = window.scrollY;
    background.style.top = value * 0.75 + 'px';
  })
}
