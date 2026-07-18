const doc = document.documentElement;
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('#navToggle');
const navLinks = document.querySelector('#navLinks');
const themeToggle = document.querySelector('#themeToggle');
const scrollProgress = document.querySelector('#scrollProgress');
const audienceSummary = document.querySelector('#audienceSummary');
const audienceButtons = document.querySelectorAll('.audience-button');

const audienceCopy = {
  universities: 'Computer Engineering undergraduate combining multidisciplinary research, patient-level model evaluation, computer vision, robotics, embedded systems, data analysis, and responsible technical reporting.',
  internships: 'AI Software Engineering Intern with practical experience connecting Angular, Spring Boot, FastAPI, and Gemini workflows, supported by projects in Python, Java, computer vision, robotics, embedded hardware, and Linux.',
  companies: 'A systems-focused engineer who traces issues across frontend, backend, AI, and hardware workflows while emphasizing integration testing, disciplined debugging, technical communication, and maintainable implementation.'
};

const savedTheme = localStorage.getItem('moa-theme');
const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
setTheme(savedTheme || (systemLight ? 'light' : 'dark'));

themeToggle.addEventListener('click', () => {
  const next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  localStorage.setItem('moa-theme', next);
});

function setTheme(theme) {
  doc.dataset.theme = theme;
  themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

audienceButtons.forEach(button => {
  button.addEventListener('click', () => {
    audienceButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const audience = button.dataset.audience;
    audienceSummary.animate(
      [{ opacity: 0.3, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 280, easing: 'ease-out' }
    );
    audienceSummary.textContent = audienceCopy[audience];
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -45px' });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

function updateScrollUI() {
  header.classList.toggle('scrolled', window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

document.querySelector('#currentYear').textContent = new Date().getFullYear();
