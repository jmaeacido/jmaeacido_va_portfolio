const root = document.documentElement;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeIcon = document.querySelector(".theme-icon");
const year = document.querySelector("[data-year]");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const modal = document.querySelector("[data-project-modal]");
const modalTitle = document.querySelector("[data-modal-title]");

const savedTheme = localStorage.getItem("portfolio-theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("portfolio-theme", theme);
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  }
}

setTheme(initialTheme);

if (year) {
  year.textContent = new Date().getFullYear();
}

function closeMobileNav() {
  navPanel?.classList.remove("open");
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open navigation menu");
}

navToggle?.addEventListener("click", () => {
  const isOpen = navPanel.classList.toggle("open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 12);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const sections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0
  }
);

sections.forEach((section) => sectionObserver.observe(section));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !shouldShow);
    });
  });
});

document.querySelectorAll("[data-project-open]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!modal || !modalTitle) return;

    modalTitle.textContent = button.dataset.projectOpen;

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      alert(`${button.dataset.projectOpen}\n\nAdd sanitized screenshots, outcomes, and project notes here.`);
    }
  });
});

document.querySelector("[data-modal-close]")?.addEventListener("click", () => {
  modal?.close();
});

modal?.addEventListener("click", (event) => {
  const dialogBounds = modal.getBoundingClientRect();
  const isOutside =
    event.clientX < dialogBounds.left ||
    event.clientX > dialogBounds.right ||
    event.clientY < dialogBounds.top ||
    event.clientY > dialogBounds.bottom;

  if (isOutside) {
    modal.close();
  }
});

function encodeFormData(formData) {
  return new URLSearchParams(formData).toString();
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fields = [...contactForm.querySelectorAll("input, textarea")];
  let isValid = true;

  fields.forEach((field) => {
    const label = field.closest("label");
    const fieldValid = field.checkValidity();

    label?.classList.toggle("invalid", !fieldValid);
    if (!fieldValid) {
      isValid = false;
    }
  });

  if (formNote) {
    formNote.textContent = isValid
      ? "Sending your message..."
      : "Please complete the required fields before sending.";
  }

  if (!isValid) return;

  const submitButton = contactForm.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeFormData(new FormData(contactForm))
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    window.location.href = "/thank-you.html";
  } catch (error) {
    if (formNote) {
      formNote.textContent = "Sorry, the message could not be sent. Please email me directly at 94jmaea94@gmail.com.";
    }
    submitButton?.removeAttribute("disabled");
  }
});

contactForm?.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    field.closest("label")?.classList.toggle("invalid", !field.checkValidity());
  });
});
