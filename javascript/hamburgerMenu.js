export function showSidebar() {
  const sidebar = document.querySelector('.sidebar-mobile');
  const sidebarItems = document.querySelectorAll('.sidebar-mobile__item');
  const hamburger = document.querySelector('.nav__hamburger');
  const hamburgerIcon = document.querySelector('.nav__hamburger-icon');
  const closeIcon = document.querySelector('.nav__hamburger-close');
  const navbarMobile = document.querySelector('.nav__mobile');

  if (!sidebar || !hamburger || !hamburgerIcon || !closeIcon || !navbarMobile) return;

  // Open & close sidebar on hamburger icon click
  function toggleMenu() {
    if (sidebar.classList.contains('show-sidebar')) {
      navbarMobile.classList.remove('nav__mobile--open');
      sidebar.classList.remove('show-sidebar');
      closeIcon.style.display = 'none';
      hamburgerIcon.style.display = 'block';
    } else {
      navbarMobile.classList.add('nav__mobile--open');
      sidebar.classList.add('show-sidebar');
      closeIcon.style.display = 'block';
      hamburgerIcon.style.display = 'none';
    }
  }

  // Close sidebar on clicks outside of sidebar
  function closeSideBarOnClickOutside(e) {
    if (
      sidebar.classList.contains('show-sidebar') &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu();
    }
  }

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  // Close sidebar when user clicks on link in sidebar
  sidebarItems.forEach((item) => {
    item.addEventListener('click', toggleMenu);
  });

  document.addEventListener('click', (event) =>
    closeSideBarOnClickOutside(event)
  );
}
