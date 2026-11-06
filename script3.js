

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

/* =========================
   TYPING ANIMATION
========================= */

const typingText = document.getElementById("typingText");

const phrases = [
    "WEB DEVELOPER IN TRAINING",
    "CREATIVE PROBLEM SOLVER",
    "FUTURE TECH INNOVATOR",
    "ALWAYS LEARNING SOMETHING NEW"
];

let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeEffect() {
    const phrase = phrases[phraseIndex];

    typingText.textContent = deleting
        ? phrase.substring(0, characterIndex - 1)
        : phrase.substring(0, characterIndex + 1);

    characterIndex += deleting ? -1 : 1;

    let delay = deleting ? 35 : 75;

    if (!deleting && characterIndex === phrase.length) {
        deleting = true;
        delay = 1400;
    } else if (deleting && characterIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400;
    }

    window.setTimeout(typeEffect, delay);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typeEffect();
} else {
    typingText.textContent = phrases[0];
}

/* =========================
   SCROLL REVEAL ANIMATION
========================= */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealElements.forEach((element, index) => {
        element.style.transitionDelay = `${(index % 4) * 100}ms`;
        observer.observe(element);
    });

} else {
    revealElements.forEach(element => {
        element.classList.add("visible");
    });
}