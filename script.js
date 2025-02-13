document.addEventListener("DOMContentLoaded", function () {
  /** Headshot Expand Effect on Mobile **/
  const image = document.querySelector(".about-image");

  function checkImageVisibility() {
      const rect = image.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) { // When 80% visible
          image.classList.add("in-view");
      }
  }

  if (window.innerWidth <= 768) {
      document.addEventListener("scroll", checkImageVisibility);
      checkImageVisibility(); // Run on page load in case it's already visible
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
      if (rect.top < window.innerHeight * 0.8) { // If the button is 80% visible
          triggerHoverEffect();
          document.removeEventListener("scroll", checkButtonVisibility); // Run only once
      }
  }

  if (window.innerWidth > 768) {
      // If desktop, run effect immediately after 2s
      setTimeout(triggerHoverEffect, 2000);
  } else {
      // If mobile, wait for buttons to enter viewport
      document.addEventListener("scroll", checkButtonVisibility);
      checkButtonVisibility(); // Check immediately in case it's already in view
  }

  /** Fun Mode Toggle with Dual Wave Effect **/
  const funToggle = document.getElementById("fun-toggle");
  const body = document.body;
  const banner = document.querySelector(".banner img");
  const funModeSection = document.getElementById("fun-mode-section");

  funToggle.addEventListener("change", function () {
    // Hide all content during transition
    body.classList.add("transitioning");

    // Create the fade effect elements
    const waveTop = document.createElement("div");
    const waveBottom = document.createElement("div");
    waveTop.classList.add("wave-top");
    waveBottom.classList.add("wave-bottom");
    document.body.appendChild(waveTop);
    document.body.appendChild(waveBottom);

    if (body.classList.contains("fun-mode")) {
        // If already in Fun Mode, animate the reverse fade to reset
        waveTop.classList.add("reverse");
        waveBottom.classList.add("reverse");

        setTimeout(() => {
            body.classList.remove("fun-mode");
            body.classList.remove("active"); // Ensure background changes AFTER wave

            // Restore original banner
            banner.src = "images/DYLANtest.png";

            // Hide Fun Mode Section
            const funModeSection = document.getElementById("fun-mode-section");
            funModeSection.classList.remove("hidden-section");
            funModeSection.style.opacity = "0";

            // Remove fade effect and reveal content again
            setTimeout(() => {
                waveTop.remove();
                waveBottom.remove();
                body.classList.remove("transitioning"); // Reveal content
                funModeSection.style.display = "none"; // Fully hide section
            }, 1500);
        }, 500);
    } else {
        // Toggle Fun Mode On (Normal Fade Effect)
        setTimeout(() => {
            body.classList.add("fun-mode");
            body.classList.add("active"); // Delayed background change

            // Change Banner Image
            banner.src = "images/DCOrangeBanner.png";

            // Show Fun Mode Section
            const funModeSection = document.getElementById("fun-mode-section");
            funModeSection.style.display = "block";
            setTimeout(() => {
                funModeSection.style.opacity = "1"; // Smooth fade-in effect
            }, 500);

            // Remove fade effect and reveal content again
            setTimeout(() => {
                waveTop.remove();
                waveBottom.remove();
                body.classList.remove("transitioning"); // Reveal content
            }, 1500);
        }, 500);
    }
});
});