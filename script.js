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

const aiChatLauncher = document.querySelector('#aiChatLauncher');
const aiChatPanel = document.querySelector('#aiChatPanel');
const aiChatClose = document.querySelector('#aiChatClose');
const aiChatForm = document.querySelector('#aiChatForm');
const aiChatInput = document.querySelector('#aiChatInput');
const aiChatMessages = document.querySelector('#aiChatMessages');
const aiChatSuggestions = document.querySelector('#aiChatSuggestions');
const aiChatHistory = [];
let aiChatBusy = false;

function setChatOpen(open) {
  aiChatPanel.hidden = !open;
  aiChatLauncher.setAttribute('aria-expanded', String(open));
  if (open) window.setTimeout(() => aiChatInput.focus(), 50);
}

function addChatMessage(text, role, pending = false) {
  const message = document.createElement('div');
  message.className = `ai-message ${role}${pending ? ' pending' : ''}`;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  message.appendChild(paragraph);
  aiChatMessages.appendChild(message);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  return message;
}

function chatApiUrl() {
  const configured = String(window.MOA_CHAT_API_URL || '').trim();
  return configured || '/api/chat';
}

async function askPortfolioAssistant(question) {
  if (aiChatBusy) return;
  aiChatBusy = true;
  aiChatForm.setAttribute('aria-busy', 'true');
  aiChatInput.disabled = true;
  addChatMessage(question, 'user');
  aiChatHistory.push({ role: 'user', content: question });
  const pending = addChatMessage('Thinking…', 'assistant', true);

  try {
    const response = await fetch(chatApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: aiChatHistory.slice(-8) })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'The assistant is temporarily unavailable.');

    const answer = String(payload.answer || '').trim();
    if (!answer) throw new Error('The assistant returned an empty response.');
    pending.querySelector('p').textContent = answer;
    pending.classList.remove('pending');
    aiChatHistory.push({ role: 'assistant', content: answer });
  } catch (error) {
    pending.querySelector('p').textContent = error.message.includes('Failed to fetch')
      ? 'The assistant backend is not connected yet. Please use the contact section for now.'
      : error.message;
    pending.classList.remove('pending');
    pending.classList.add('error');
  } finally {
    aiChatBusy = false;
    aiChatForm.removeAttribute('aria-busy');
    aiChatInput.disabled = false;
    aiChatInput.focus();
  }
}

aiChatLauncher?.addEventListener('click', () => setChatOpen(aiChatPanel.hidden));
aiChatClose?.addEventListener('click', () => setChatOpen(false));
aiChatSuggestions?.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  aiChatSuggestions.hidden = true;
  askPortfolioAssistant(button.textContent.trim());
});
aiChatForm?.addEventListener('submit', event => {
  event.preventDefault();
  const question = aiChatInput.value.trim();
  if (!question) return;
  aiChatInput.value = '';
  aiChatInput.style.height = '';
  aiChatSuggestions.hidden = true;
  askPortfolioAssistant(question);
});
aiChatInput?.addEventListener('input', () => {
  aiChatInput.style.height = '';
  aiChatInput.style.height = `${Math.min(aiChatInput.scrollHeight, 120)}px`;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !aiChatPanel.hidden) setChatOpen(false);
});
