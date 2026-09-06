"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeRevealAnimations();
  initializeAccordions();
  initializeCounters();
  initializeAppointmentForm();
  initializeCurrentYear();
  initializeSmoothAnchors();
});

function initializeNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!menuToggle || !navMenu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu =
      navMenu.contains(event.target) || menuToggle.contains(event.target);

    if (!clickedInsideMenu) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }
  });
}

function initializeRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");

  if (!revealElements.length) {
    return;
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealElements.forEach((element) => {
      element.classList.add("show");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("show");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 35, 250)}ms`;
    observer.observe(element);
  });
}

function initializeAccordions() {
  const accordionTriggers = document.querySelectorAll(".accordion-trigger");

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion-item");

      if (!item) {
        return;
      }

      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".accordion-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");

          const openTrigger = openItem.querySelector(".accordion-trigger");

          if (openTrigger) {
            openTrigger.setAttribute("aria-expanded", "false");
          }
        }
      });

      item.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });
}

function initializeCounters() {
  const counters = document.querySelectorAll("[data-counter]");

  if (!counters.length) {
    return;
  }

  const reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateCounter = (element) => {
    const target = Number(element.dataset.counter || 0);
    const suffix = element.dataset.suffix || "";

    if (reducedMotion || target === 0) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * easedProgress);

      element.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.6
    }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initializeAppointmentForm() {
  const form = document.querySelector("#appointmentForm");

  if (!form) {
    return;
  }

  const statusElement = document.querySelector("#formStatus");

  const setStatus = (message, type) => {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.className = `form-status ${type}`;
  };

  const clearFieldError = (field) => {
    const wrapper = field.closest(".form-field");

    if (!wrapper) {
      return;
    }

    wrapper.classList.remove("invalid");

    const error = wrapper.querySelector(".field-error");

    if (error) {
      error.textContent = "";
    }
  };

  const setFieldError = (field, message) => {
    const wrapper = field.closest(".form-field");

    if (!wrapper) {
      return;
    }

    wrapper.classList.add("invalid");

    const error = wrapper.querySelector(".field-error");

    if (error) {
      error.textContent = message;
    }
  };

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.querySelector('[name="name"]');
    const phone = form.querySelector('[name="phone"]');
    const service = form.querySelector('[name="service"]');
    const date = form.querySelector('[name="date"]');
    const message = form.querySelector('[name="message"]');

    let valid = true;

    clearFieldError(name);
    clearFieldError(phone);

    if (!name.value.trim()) {
      setFieldError(name, "Please enter your name.");
      valid = false;
    }

    const phoneDigits = phone.value.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      setFieldError(phone, "Please enter a valid phone number.");
      valid = false;
    }

    if (!valid) {
      setStatus("Please check the highlighted fields.", "error");
      return;
    }

    const formattedDate = date.value
      ? formatDateForWhatsApp(date.value)
      : "Not specified";

    const messageText = message.value.trim() || "No additional message";

    const whatsappMessage = [
      "Hello Dr. Lal Dental Clinic, I would like to request an appointment.",
      "",
      `Name: ${name.value.trim()}`,
      `Phone: ${phone.value.trim()}`,
      `Treatment: ${service.value}`,
      `Preferred date: ${formattedDate}`,
      `Message: ${messageText}`
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/919999622100?text=${encodeURIComponent(whatsappMessage)}`;

    setStatus(
      "Opening WhatsApp with your appointment request...",
      "success"
    );

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}

function formatDateForWhatsApp(dateValue) {
  const parts = dateValue.split("-");

  if (parts.length !== 3) {
    return dateValue;
  }

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  return `${day}/${month}/${year}`;
}

function initializeCurrentYear() {
  const yearElements = document.querySelectorAll("#currentYear");

  yearElements.forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

function initializeSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", targetId);
      }
    });
  });
}

window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-transition");
});
