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

  /** Blog Functionality **/
  function initializeBlog() {
    if (!document.querySelector('.blog-container')) return;

    const postList = document.getElementById('post-list');
    const timeline = document.getElementById('timeline');

    // Sort posts by date (newest first)
    const sortedPosts = [...blogPosts].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Create sidebar post previews
    sortedPosts.forEach(post => {
      const preview = createPostPreview(post);
      postList.appendChild(preview);
    });

    // Create timeline posts
    sortedPosts.forEach(post => {
      const postElement = createBlogPost(post);
      timeline.appendChild(postElement);
    });

    // Set first post as active
    if (sortedPosts.length > 0) {
      const firstPreview = postList.firstChild;
      const firstPost = timeline.firstChild;
      firstPreview.classList.add('active');
      firstPost.classList.add('active');
    }
  }

  function createPostPreview(post) {
    const preview = document.createElement('div');
    preview.className = 'post-preview';
    preview.dataset.postId = post.id;

    preview.innerHTML = `
      <h4>${post.shortTitle}</h4>
      <div class="post-date">${formatDate(post.date)}</div>
      <div class="post-tags">
        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
      </div>
    `;

    preview.addEventListener('click', () => {
      // Remove active class from all previews
      document.querySelectorAll('.post-preview').forEach(p => p.classList.remove('active'));
      // Add active class to clicked preview
      preview.classList.add('active');
      // Scroll to corresponding post
      const postElement = document.querySelector(`.blog-post[data-post-id="${post.id}"]`);
      postElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return preview;
  }

  function createBlogPost(post) {
    const postElement = document.createElement('article');
    postElement.className = 'blog-post';
    postElement.dataset.postId = post.id;

    const content = post.content.split('\n\n');
    const previewContent = content[0];
    const fullContent = content.join('\n\n');

    postElement.innerHTML = `
      <h2>${post.title}</h2>
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
        <div class="post-tags">
          ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div class="post-content collapsed">
        ${previewContent}
      </div>
      <button class="expand-button">Read More</button>
    `;

    const expandButton = postElement.querySelector('.expand-button');
    const contentDiv = postElement.querySelector('.post-content');

    expandButton.addEventListener('click', () => {
      if (contentDiv.classList.contains('collapsed')) {
        contentDiv.textContent = fullContent;
        contentDiv.classList.remove('collapsed');
        expandButton.textContent = 'Show Less';
      } else {
        contentDiv.textContent = previewContent;
        contentDiv.classList.add('collapsed');
        expandButton.textContent = 'Read More';
      }
    });

    return postElement;
  }

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  // Initialize blog when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
  });
});