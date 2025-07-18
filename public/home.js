document.addEventListener('DOMContentLoaded', () => {
  // Welcome message alert
  const welcomeMessage = "Welcome to the N.C.E.C attendance webapp! Navigate to the desired section using the menu.";
  alert(welcomeMessage);

  // Handle navigation clicks (optional functionality)
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      console.log(`Navigating to: ${event.target.textContent}`);
    });
  });
});