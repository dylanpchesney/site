console.log('Main script starting...');

// Move the initialization code outside the DOMContentLoaded event
console.log('Setting up initialization...');

// Blog-related variables
let currentPage = 1;
let currentSearchQuery = '';
let isLoading = false;
let hasMorePosts = true;

// Function to show "no posts" message
function showNoPostsMessage() {
  const postList = document.querySelector('.post-list');
  const timeline = document.querySelector('.timeline');
  
  if (postList) {
    postList.innerHTML = '<div class="no-posts-message">No posts available</div>';
  }
  
  if (timeline) {
    timeline.innerHTML = `
      <div class="no-posts-container">
        <h2>📝 No Posts Available</h2>
        <p>There are no posts at this time! Check back later for more!</p>
        <p>I'm probably busy writing something amazing for you to read. ✨</p>
      </div>
    `;
  }
}

// Fallback function when Contentful is not available
window.fallbackFetchBlogPosts = function(page = 1, searchQuery = '') {
  console.log('Contentful unavailable, showing no posts message');
  
  return Promise.resolve({
    posts: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalPosts: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  });
};

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

// Initialize blog functionality
function initializeBlog() {
  console.log('Initializing blog functionality...');
  
  // Ensure we have a fetchBlogPosts function available
  if (!window.fetchBlogPosts) {
    console.log('Contentful fetchBlogPosts not available, using fallback');
    window.fetchBlogPosts = window.fallbackFetchBlogPosts;
  }
  
  // Initialize search functionality
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  console.log('Search elements found:', {
    searchInput: searchInput ? 'found' : 'not found',
    searchButton: searchButton ? 'found' : 'not found'
  });
  
  if (searchInput && searchButton) {
    // Search on button click
    searchButton.addEventListener('click', () => {
      console.log('Search button clicked');
      const searchQuery = searchInput.value.trim();
      currentPage = 1;
      hasMorePosts = true;
      loadBlogPosts(1, searchQuery);
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('Search input enter pressed');
        const searchQuery = searchInput.value.trim();
        currentPage = 1;
        hasMorePosts = true;
        loadBlogPosts(1, searchQuery);
      }
    });
  }
  
  // Infinite scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && hasMorePosts && !isLoading) {
        console.log('Intersection observer triggered');
        loadBlogPosts(currentPage + 1, currentSearchQuery, true);
      }
    });
  }, {
    rootMargin: '100px'
  });
  
  // Observe the last post in the timeline
  const observeLastPost = () => {
    const posts = document.querySelectorAll('.blog-post');
    if (posts.length > 0) {
      observer.observe(posts[posts.length - 1]);
    }
  };
  
  // Initial load
  console.log('Starting initial blog post load...');
  loadBlogPosts().then(() => {
    console.log('Initial blog posts loaded');
    observeLastPost();
  });
  
  // Observe new posts as they're added
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const timelineObserver = new MutationObserver(() => {
      observeLastPost();
    });
    
    timelineObserver.observe(timeline, {
      childList: true
    });
  }
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  console.log('DOM Content Loaded');
  initializeBlog();
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already loaded, initializing immediately');
  initializeBlog();
}

/** Headshot Expand Effect on Mobile **/
const image = document.querySelector(".about-image");
if (image) {
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
}

/** CTA Button Hover Effect **/
const contactButton = document.querySelector(".contact");
const linkedinButton = document.querySelector(".linkedin");
if (contactButton && linkedinButton) {
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
}

/** Fun Mode Toggle with Dual Wave Effect **/
const funToggle = document.getElementById("fun-toggle");
const body = document.body;
const banner = document.querySelector(".banner img");
const funModeSection = document.getElementById("fun-mode-section");

if (funToggle) {
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
        if (banner) banner.src = "images/DYLANtest.png";
        if (funModeSection) {
          funModeSection.classList.remove("hidden-section");
          funModeSection.style.opacity = "0";
        }

        setTimeout(() => {
          waveTop.remove();
          waveBottom.remove();
          body.classList.remove("transitioning");
          if (funModeSection) funModeSection.style.display = "none";
        }, 1500);
      }, 500);
    } else {
      setTimeout(() => {
        body.classList.add("fun-mode");
        body.classList.add("active");
        if (banner) banner.src = "images/DCOrangeBanner.png";
        if (funModeSection) {
          funModeSection.style.display = "block";
          setTimeout(() => {
            funModeSection.style.opacity = "1";
          }, 500);
        }

        setTimeout(() => {
          waveTop.remove();
          waveBottom.remove();
          body.classList.remove("transitioning");
        }, 1500);
      }, 500);
    }
  });
}

/** Blog Functionality **/
async function loadBlogPosts(page = 1, searchQuery = '', append = false) {
  if (isLoading || (!hasMorePosts && append)) {
    console.log('Skipping loadBlogPosts - isLoading:', isLoading, 'hasMorePosts:', hasMorePosts, 'append:', append);
    return;
  }
  
  try {
    isLoading = true;
    console.log('Starting loadBlogPosts - page:', page, 'search:', searchQuery, 'append:', append);
    
    const result = await fetchBlogPosts(page, searchQuery);
    console.log('fetchBlogPosts result:', result);
    
    const { posts, pagination } = result;
    
    console.log('Received posts:', posts);
    console.log('Pagination info:', pagination);
    
    // Update current page and search query
    currentPage = pagination.currentPage;
    currentSearchQuery = searchQuery;
    hasMorePosts = pagination.hasNextPage;
    
    // Get containers
    const postList = document.querySelector('.post-list');
    const timeline = document.querySelector('.timeline');
    
    console.log('Containers found:', { 
      postList: postList ? 'found' : 'not found', 
      timeline: timeline ? 'found' : 'not found'
    });
    
    if (!postList || !timeline) {
      console.error('Required containers not found');
      return;
    }
    
    // Clear containers if not appending
    if (!append) {
      console.log('Clearing containers');
      postList.innerHTML = '';
      timeline.innerHTML = '';
    }
    
    // Check if we have any posts to display
    if (!posts || posts.length === 0) {
      if (!append) { // Only show the message if this is not an append operation
        console.log('No posts available, showing no posts message');
        showNoPostsMessage();
      }
      return;
    }
    
    // Process each post
    for (const post of posts) {
      console.log('Processing post:', post);
      
      // Create and append post preview
      const preview = createPostPreview(post);
      console.log('Created preview:', preview);
      postList.appendChild(preview);
      
      // Create and append blog post
      const blogPost = createBlogPost(post);
      console.log('Created blog post:', blogPost);
      timeline.appendChild(blogPost);
    }
    
    // Auto-expand the most recent post (first post) if not appending
    if (!append && posts.length > 0) {
      console.log('Auto-expanding most recent post');
      
      // Use setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        const firstPreview = postList.querySelector('.post-preview');
        const firstBlogPost = timeline.querySelector('.blog-post');
        
        if (firstPreview && firstBlogPost) {
          // Add active classes
          firstPreview.classList.add('active');
          firstBlogPost.classList.add('active');
          
          // Expand the content
          const content = firstBlogPost.querySelector('.post-content');
          const expandButton = firstBlogPost.querySelector('.expand-button');
          
          if (content && expandButton) {
            content.classList.remove('collapsed');
            expandButton.textContent = 'Show Less';
          }
          
          console.log('Most recent post auto-expanded');
        }
      }, 100);
    }
    
    console.log('Finished processing posts');
  } catch (error) {
    console.error('Error in loadBlogPosts:', error);
    // Show no posts message on error
    if (!append) {
      showNoPostsMessage();
    }
  } finally {
    isLoading = false;
  }
}

function createPostPreview(post) {
    console.log('Creating post preview:', post);
    const preview = document.createElement('div');
    preview.className = 'post-preview';
    preview.dataset.postId = post.id;
    
    preview.innerHTML = `
        <h4>${post.title}</h4>
        <div class="post-date">${formatDate(post.date)}</div>
        <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
        </div>
    `;
    
    // Add click handler to the entire preview
    preview.addEventListener('click', () => {
        console.log('Post preview clicked:', post.title);
        // Find the corresponding blog post using the data attribute
        const blogPost = document.querySelector(`.blog-post[data-post-id="${post.id}"]`);
        if (blogPost) {
            // Remove active class from all previews and posts
            document.querySelectorAll('.post-preview').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.blog-post').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked preview and corresponding post
            preview.classList.add('active');
            blogPost.classList.add('active');
            
            // Expand the post content
            const content = blogPost.querySelector('.post-content');
            const expandButton = blogPost.querySelector('.expand-button');
            if (content && expandButton) {
                content.classList.remove('collapsed');
                expandButton.textContent = 'Show Less';
            }
            
            // Scroll to the post
            blogPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    
    return preview;
}

function createBlogPost(post) {
  console.log('Creating blog post for:', post);
  const postElement = document.createElement('article');
  postElement.className = 'blog-post';
  postElement.dataset.postId = post.id;
  
  const title = document.createElement('h2');
  title.textContent = post.title;
  
  const meta = document.createElement('div');
  meta.className = 'post-meta';
  
  const date = document.createElement('div');
  date.className = 'post-date';
  date.textContent = formatDate(post.date);
  
  const tags = document.createElement('div');
  tags.className = 'post-tags';
  if (post.tags && post.tags.length > 0) {
    post.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'post-tag';
      tagSpan.textContent = tag;
      tags.appendChild(tagSpan);
    });
  }
  
  meta.appendChild(date);
  meta.appendChild(tags);
  
  const content = document.createElement('div');
  content.className = 'post-content collapsed';
  content.innerHTML = post.content;
  
  const expandButton = document.createElement('button');
  expandButton.className = 'expand-button';
  expandButton.textContent = 'Show More';
  
  expandButton.addEventListener('click', (e) => {
    console.log('Expand button clicked for post:', post.id);
    e.preventDefault();
    const isCollapsed = content.classList.contains('collapsed');
    
    if (isCollapsed) {
      // Collapse all other posts first
      document.querySelectorAll('.blog-post').forEach(p => {
        if (p !== postElement) {
          const pContent = p.querySelector('.post-content');
          const pButton = p.querySelector('.expand-button');
          if (pContent && pButton) {
            pContent.classList.add('collapsed');
            pButton.textContent = 'Show More';
          }
        }
      });
    }
    
    content.classList.toggle('collapsed');
    expandButton.textContent = content.classList.contains('collapsed') ? 'Show More' : 'Show Less';
  });
  
  postElement.appendChild(title);
  postElement.appendChild(meta);
  postElement.appendChild(content);
  postElement.appendChild(expandButton);
  
  console.log('Created blog post element:', postElement);
  return postElement;
}

function formatDate(dateString) {
  // Create date object and adjust for timezone
  const date = new Date(dateString);
  // Add the timezone offset to ensure the date is displayed correctly
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC' // Force UTC to prevent timezone conversion
  };
  return adjustedDate.toLocaleDateString('en-US', options);
}