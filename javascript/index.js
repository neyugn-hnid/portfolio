import { showSidebar } from './hamburgerMenu.js';
import { typeAnimation } from './typeAnimation.js';
import { intersectionObserver } from './intersectionObserver.js';
import { parallaxHero } from './parallaxHero.js';
import './animations.js';
import { load } from "./load.js";

async function main() {
  showSidebar();
  intersectionObserver();
  parallaxHero();
  await load()
  typeAnimation();
}

main();
