document.addEventListener("DOMContentLoaded", function () {
  // Debounce helper function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /** Headshot Expand Effect on Mobile **/
  const image = document.querySelector(".about-image");

  function checkImageVisibility() {
    const rect = image.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      image.classList.add("in-view");
    }
  }

  const debouncedCheckImageVisibility = debounce(checkImageVisibility, 100);

  if (window.innerWidth <= 768) {
    document.addEventListener("scroll", debouncedCheckImageVisibility);
    checkImageVisibility();
  }

  /** CTA Button Hover Effect **/
  const contactButton = document.querySelector(".contact");
  const linkedinButton = document.querySelector(".linkedin");

  function triggerHoverEffect() {
    setTimeout(() => {
      contactButton.classList.add("hover-effect");
      setTimeout(() => {
        contactButton.classList.remove("hover-effect");
        setTimeout(() => {
          linkedinButton.classList.add("hover-effect");
          setTimeout(() => {
            linkedinButton.classList.remove("hover-effect");
          }, 1750); // Slowed down (was 1000ms)
        }, 1000); // Small delay before LinkedIn animation (was 500ms)
      }, 1750); // Contact button fades back (was 1000ms)
    }, 1500); // Initial delay before animation starts (was 1000ms)
  }

  function checkButtonVisibility() {
    const rect = contactButton.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      triggerHoverEffect();
      document.removeEventListener("scroll", debouncedCheckButtonVisibility);
    }
  }

  const debouncedCheckButtonVisibility = debounce(checkButtonVisibility, 100);

  if (window.innerWidth > 768) {
    setTimeout(triggerHoverEffect, 2000);
  } else {
    document.addEventListener("scroll", debouncedCheckButtonVisibility);
    checkButtonVisibility();
  }

  /** Fun Mode Toggle with Dual Wave Effect **/
  const funToggle = document.getElementById("fun-toggle");
  const body = document.body;
  const banner = document.querySelector(".banner img");
  const funModeSection = document.getElementById("fun-mode-section");

  funToggle.addEventListener("change", function () {
    body.classList.add("transitioning");

    const waveTop = document.createElement("div");
    const waveBottom = document.createElement("div");
    waveTop.classList.add("wave-top");
    waveBottom.classList.add("wave-bottom");
    document.body.appendChild(waveTop);
    document.body.appendChild(waveBottom);

    if (body.classList.contains("fun-mode")) {
      waveTop.classList.add("reverse");
      waveBottom.classList.add("reverse");

      setTimeout(() => {
        body.classList.remove("fun-mode");
        body.classList.remove("active");
        banner.src = "images/DYLANtest.png";
        funModeSection.classList.remove("hidden-section");
        funModeSection.style.opacity = "0";

        setTimeout(() => {
          waveTop.remove();
          waveBottom.remove();
          body.classList.remove("transitioning");
          funModeSection.style.display = "none";
        }, 1500);
      }, 500);
    } else {
      setTimeout(() => {
        body.classList.add("fun-mode");
        body.classList.add("active");
        banner.src = "images/DCOrangeBanner.png";
        funModeSection.style.display = "block";
        
        setTimeout(() => {
          funModeSection.style.opacity = "1";
        }, 500);

        setTimeout(() => {
          waveTop.remove();
          waveBottom.remove();
          body.classList.remove("transitioning");
        }, 1500);
      }, 500);
    }
  });
});