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
});