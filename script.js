(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }
  window.showToast = showToast;

  // Animated starfield canvas: adapts to screen size and device pixel ratio.
  const canvas = $('#stars');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [], width = 0, height = 0, raf = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function resizeStars() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(170, Math.floor((width * height) / 8500));
      stars = Array.from({length: count}, () => ({x:Math.random()*width, y:Math.random()*height, r:Math.random()*1.35+.25, alpha:Math.random()*.6+.2, speed:Math.random()*.22+.035, phase:Math.random()*Math.PI*2}));
      drawStars(0);
    }
    function drawStars(time) {
      ctx.clearRect(0,0,width,height);
      for (const star of stars) {
        const twinkle = reducedMotion ? 1 : .65 + Math.sin(time*.001*star.speed*8 + star.phase)*.35;
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(190,225,255,${star.alpha*twinkle})`; ctx.fill();
        if (!reducedMotion) { star.y += star.speed*.16; if (star.y > height) { star.y = -2; star.x = Math.random()*width; } }
      }
      if (!reducedMotion) raf = requestAnimationFrame(drawStars);
    }
    window.addEventListener('resize', resizeStars, {passive:true});
    resizeStars();
    if (!reducedMotion) raf = requestAnimationFrame(drawStars);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else if (!reducedMotion) raf = requestAnimationFrame(drawStars); });
  }

  // Reveal page sections when they enter the viewport.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -35px 0px'});
    revealItems.forEach(el => revealObserver.observe(el));
  } else revealItems.forEach(el => el.classList.add('visible'));
  // Also reveal the hero immediately, since it is above the fold.
  $$('.hero .reveal').forEach(el => el.classList.add('visible'));

  // Navbar glass effect, active section indicator and mobile menu.
  const header = $('header');
  const nav = $('#navLinks');
  const menuBtn = $('#menuBtn');
  const navLinks = $$('#navLinks a');
  function closeMenu() {
    if (nav) nav.classList.remove('open');
    if (menuBtn) { menuBtn.setAttribute('aria-expanded','false'); const icon = $('i', menuBtn); if (icon) icon.className = 'fa-solid fa-bars'; }
  }
  if (menuBtn && nav) menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    const icon = $('i', menuBtn); if (icon) icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  function updateHeader() { if (header) header.classList.toggle('scrolled', window.scrollY > 18); }
  window.addEventListener('scroll', updateHeader, {passive:true}); updateHeader();
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id)); });
    }, {rootMargin:'-30% 0px -55% 0px'});
    sections.forEach(section => sectionObserver.observe(section));
  }

  // UTC clock and footer year.
  const clock = $('#clock');
  function updateClock() { if (clock) clock.textContent = new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()) + ' UTC'; }
  updateClock(); setInterval(updateClock,1000);
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
  // Hazard filter controls.
  const filterWrap = $('#hazardFilters');
  if (filterWrap) filterWrap.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]'); if (!button) return;
    $$('.filter-btn', filterWrap).forEach(btn => btn.classList.toggle('active', btn === button));
    const filter = button.dataset.filter;
    $$('.hazard-card').forEach(card => {
      const show = filter === 'all' || card.dataset.type === filter;
      card.hidden = !show;
      if (show) { card.animate?.([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'ease-out'}); }
    });
  });

  // Gallery modal and hazard detail modal.
  const modal = $('#modal'); const modalTitle = $('#modalTitle'); const modalDescription = $('#modalDescription'); const modalImage = $('#modalImage');
  function openDetail(title, description, image = '') {
    if (!modal) return;
    if (modalTitle) modalTitle.textContent = title || 'Details';
    if (modalDescription) modalDescription.textContent = description || '';
    if (modalImage) { modalImage.style.display = image ? 'block' : 'none'; modalImage.src = image || ''; modalImage.alt = title || 'Gallery image'; }
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function closeDetail() { if (modal) modal.classList.remove('open'); document.body.style.overflow = ''; if (modalImage) modalImage.src = ''; }
  $('#modalClose')?.addEventListener('click', closeDetail);
  modal?.addEventListener('click', e => { if (e.target === modal) closeDetail(); });
  $$('.gallery-card').forEach(card => {
    const open = () => openDetail(card.dataset.title, card.dataset.description, card.dataset.image || $('img',card)?.src || '');
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  $$('.detail-btn').forEach(btn => btn.addEventListener('click', () => openDetail(btn.dataset.title, btn.dataset.info)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDetail(); closeLogin(); closeMenu(); } });

  // Front-end demonstration login/signup. This is not secure authentication.
  const loginModal = $('#loginModal'); const loginForm = $('#loginForm'); const loginMessage = $('#loginMessage');
  const loginHeading = $('.login-box h2'); const loginSubtitle = $('.login-box > p'); const submitButton = $('.submit-btn'); const signupText = $('.signup-text');
  let signupMode = false;
  function openLogin() { if (!loginModal) return; loginModal.classList.add('active'); loginModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setTimeout(() => $('#loginEmail')?.focus(),80); }
  function closeLogin() { if (!loginModal) return; loginModal.classList.remove('active'); loginModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if(loginMessage) loginMessage.textContent=''; }
  window.openLogin = openLogin; window.closeLogin = closeLogin;
  window.togglePassword = function() { const input = $('#loginPassword'); const icon = $('.password-toggle'); if (!input) return; input.type = input.type === 'password' ? 'text' : 'password'; if(icon) icon.classList.toggle('fa-eye-slash',input.type==='text'); };
  window.forgotPassword = function(event) { event?.preventDefault(); if(loginMessage) { loginMessage.style.color='var(--yellow)'; loginMessage.textContent='Password reset is a demo feature. No email has been sent.'; } };
  window.showSignup = function(event) {
    event?.preventDefault(); signupMode = !signupMode;
    if(loginHeading) loginHeading.textContent = signupMode ? 'Create Account' : 'Welcome Back';
    if(loginSubtitle) loginSubtitle.textContent = signupMode ? 'Join the AeroVision mission' : 'Login to your AeroVision account';
    if(submitButton) submitButton.textContent = signupMode ? 'Create Account' : 'Login';
    if(signupText) signupText.innerHTML = signupMode ? 'Already have an account? <a href="#" onclick="showSignup(event)">Login</a>' : 'Don\'t have an account? <a href="#" onclick="showSignup(event)">Sign up</a>';
    if(loginMessage) loginMessage.textContent='';
  };
  loginModal?.addEventListener('click', e => { if(e.target === loginModal) closeLogin(); });
  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#loginEmail')?.value.trim() || ''; const password = $('#loginPassword')?.value || '';
    if (!email || !password) return;
    const name = (email.split('@')[0] || 'Explorer').replace(/[._-]+/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    const firstTwo = name.replace(/\s/g,'').slice(0,2).toUpperCase();
    const loginBtnText = $('#loginBtnText'); const loginBtn = $('#loginBtn');
    if (loginBtnText) loginBtnText.textContent = firstTwo || 'ME';
    if (loginBtn) { loginBtn.title = 'Signed in as ' + name; loginBtn.setAttribute('aria-label','Account: ' + name + '. Click to sign out'); }
    if(loginMessage) { loginMessage.style.color='var(--green)'; loginMessage.textContent = signupMode ? 'Demo account created! You are now signed in.' : 'Demo login successful. Welcome, ' + name + '!'; }
    showToast('Welcome to AeroVision, ' + name + '!');
    if(submitButton) submitButton.disabled = true;
    setTimeout(() => { closeLogin(); if(submitButton) submitButton.disabled = false; }, 900);
    // Demo-only state: do not use this form for real credentials.
    if (loginBtn) loginBtn.dataset.signedIn = 'true';
    signupMode = false;
  });
  $('#loginBtn')?.addEventListener('click', event => {
    const btn = event.currentTarget;
    if (btn.dataset.signedIn === 'true') {
      btn.dataset.signedIn = 'false'; const text = $('#loginBtnText'); if(text) text.textContent='Login'; btn.title=''; btn.setAttribute('aria-label','Login'); showToast('You have logout.');
    } else openLogin();
  });

  // Small cursor glow on cards for desktop pointer devices.
  if (window.matchMedia('(pointer:fine)').matches) {
    $$('.hazard-card, .mission-grid .panel, .gallery-card, .team-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect(); card.style.setProperty('--pointer-x', `${e.clientX-r.left}px`); card.style.setProperty('--pointer-y', `${e.clientY-r.top}px`);
      });
    });
  }
})();
// Feedback Modal Functionality
const feedbackModal = document.getElementById('feedbackModal');
const openFeedbackBtn = document.getElementById('openFeedbackBtn');
const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');

if (openFeedbackBtn && feedbackModal) {
    openFeedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'flex';
    });

    closeFeedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
    });

    // Close when clicking outside the modal box
    window.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            feedbackModal.style.display = 'none';
        }
    });
}
// --- Local Authentication & Modal Control Scripts ---

    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const modalTitleText = document.getElementById('modalTitleText');
    const modalSubText = document.getElementById('modalSubText');
    const authSwitchText = document.getElementById('authSwitchText');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginMessage = document.getElementById('loginMessage');

    // Open Modal
    function openLogin() {
        if(loginModal) loginModal.style.display = 'flex';
    }

    // Close Modal
    function closeLogin() {
        if(loginModal) loginModal.style.display = 'none';
        loginMessage.textContent = '';
    }

    // Toggle Password Visibility
    function togglePassword() {
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput) {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        }
    }

    // Switch to Sign Up View inside Modal
    function showSignup(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        modalTitleText.textContent = "Create Account";
        modalSubText.textContent = "Sign up for a new AeroVision account";
        authSwitchText.innerHTML = 'Already have an account? <a href="#" onclick="showLogin(event)">Login</a>';
        loginMessage.textContent = '';
    }

    // Switch back to Login View inside Modal
    function showLogin(e) {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        modalTitleText.textContent = "Welcome Back";
        modalSubText.textContent = "Login to your AeroVision account";
        authSwitchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="showSignup(event)">Sign up</a>';
        loginMessage.textContent = '';
    }

    // Check Active Session on Page Load
    document.addEventListener('DOMContentLoaded', () => {
        const activeUser = sessionStorage.getItem('aerovision_user');
        if (activeUser) {
            updateLoginUI(activeUser);
        }
    });

    // Handle User Registration
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;

        if (localStorage.getItem('user_' + email)) {
            loginMessage.textContent = "Account already exists! Please login.";
            loginMessage.style.color = "#dc3545";
            return;
        }

        localStorage.setItem('user_' + email, password);
        loginMessage.textContent = "Registration successful! You can now log in.";
        loginMessage.style.color = "#28a745";
        signupForm.reset();

        setTimeout(() => {
            showLogin(e);
        }, 1200);
    });

    // Handle User Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const storedPassword = localStorage.getItem('user_' + email);
        const defaultEmail = "admin@aerovision.com";
        const defaultPassword = "password123";

        let isAuthenticated = false;

        if (storedPassword && storedPassword === password) {
            isAuthenticated = true;
        } else if (email === defaultEmail && password === defaultPassword) {
            isAuthenticated = true;
        }

        if (isAuthenticated) {
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "#28a745";
            sessionStorage.setItem('aerovision_user', email);

            setTimeout(() => {
                closeLogin();
                updateLoginUI(email);
                loginForm.reset();
                loginMessage.textContent = '';
            }, 800);
        } else {
            loginMessage.textContent = "Invalid email or password.";
            loginMessage.style.color = "#dc3545";
        }
    });

    // Update Top Navigation Button Text
    function updateLoginUI(username) {
        if (loginBtnText) {
            const displayName = username.includes('@') ? username.split('@')[0] : username;
            loginBtnText.textContent = displayName;
        }
    }
