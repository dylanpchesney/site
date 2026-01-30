// Debug mode - set to false for production
const DEBUG = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// Debug logging helper
function debugLog(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

function debugError(...args) {
  console.error(...args); // Always log errors
}

// Blog-related variables
let currentPage = 1;
let currentSearchQuery = '';
let isLoading = false;
let hasMorePosts = true;

// Cached DOM elements (lazy loaded)
let cachedElements = {
  postList: null,
  timeline: null,
  searchInput: null,
  searchButton: null
};

// Function to get cached or query DOM elements
function getElement(selector, cacheKey) {
  if (cacheKey && cachedElements[cacheKey]) {
    return cachedElements[cacheKey];
  }
  const element = document.querySelector(selector);
  if (cacheKey && element) {
    cachedElements[cacheKey] = element;
  }
  return element;
}

// Function to show "no posts" message
function showNoPostsMessage() {
  const postList = getElement('.post-list', 'postList');
  const timeline = getElement('.timeline', 'timeline');
  
  try {
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
  } catch (error) {
    debugError('Error showing no posts message:', error);
  }
}

// Fallback function when Contentful is not available
window.fallbackFetchBlogPosts = function(page = 1, searchQuery = '') {
  debugLog('Contentful unavailable, showing no posts message');
  
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
  debugLog('Initializing blog functionality...');
  
  try {
    // Ensure we have a fetchBlogPosts function available
    if (!window.fetchBlogPosts) {
      debugLog('Contentful fetchBlogPosts not available, using fallback');
      window.fetchBlogPosts = window.fallbackFetchBlogPosts;
    }
    
    // Initialize search functionality
    const searchInput = getElement('#search-input', 'searchInput');
    const searchButton = getElement('#search-button', 'searchButton');
    
    debugLog('Search elements found:', {
      searchInput: searchInput ? 'found' : 'not found',
      searchButton: searchButton ? 'found' : 'not found'
    });
    
    if (searchInput && searchButton) {
      // Search on button click
      searchButton.addEventListener('click', () => {
        debugLog('Search button clicked');
        performSearch();
      });
      
      // Search on Enter key
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          debugLog('Search input enter pressed');
          performSearch();
        }
      });
      
      // Add placeholder text with tag hint
      searchInput.placeholder = 'Search posts... (try #tag for tags)';
    }
    
    // Infinite scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMorePosts && !isLoading) {
          debugLog('Intersection observer triggered');
          loadBlogPosts(currentPage + 1, currentSearchQuery, true).catch(error => {
            debugError('Error loading more posts:', error);
          });
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
    debugLog('Starting initial blog post load...');
    loadBlogPosts().then(() => {
      debugLog('Initial blog posts loaded');
      observeLastPost();
    }).catch(error => {
      debugError('Error loading initial blog posts:', error);
    });
    
    // Observe new posts as they're added
    const timeline = getElement('.timeline', 'timeline');
    if (timeline) {
      const timelineObserver = new MutationObserver(() => {
        observeLastPost();
      });
      
      timelineObserver.observe(timeline, {
        childList: true
      });
    }
  } catch (error) {
    debugError('Error initializing blog:', error);
  }
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  debugLog('DOM Content Loaded');
  initializeBlog();
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  debugLog('DOM already loaded, initializing immediately');
  initializeBlog();
}

/** Headshot Expand Effect on Mobile **/
const image = document.querySelector(".about-image");
if (image) {
  function checkImageVisibility() {
    try {
      const rect = image.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        image.classList.add("in-view");
      }
    } catch (error) {
      debugError('Error checking image visibility:', error);
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
    try {
      setTimeout(() => {
        contactButton.classList.add("hover-effect");
        setTimeout(() => {
          contactButton.classList.remove("hover-effect");
          setTimeout(() => {
            linkedinButton.classList.add("hover-effect");
            setTimeout(() => {
              linkedinButton.classList.remove("hover-effect");
            }, 1750);
          }, 1000);
        }, 1750);
      }, 1500);
    } catch (error) {
      debugError('Error triggering hover effect:', error);
    }
  }
  function checkButtonVisibility() {
    try {
      const rect = contactButton.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        triggerHoverEffect();
        document.removeEventListener("scroll", debouncedCheckButtonVisibility);
      }
    } catch (error) {
      debugError('Error checking button visibility:', error);
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

/** Keyboard Shortcuts **/
document.addEventListener('keydown', function(e) {
  // Only trigger shortcuts if not typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }

  // 'F' key toggles Fun Mode
  if (e.key.toLowerCase() === 'f') {
    e.preventDefault();
    const funToggle = document.getElementById("fun-toggle");
    if (funToggle) {
      funToggle.checked = !funToggle.checked;
      funToggle.dispatchEvent(new Event('change'));
    }
  }

  // 'H' key goes to home
  if (e.key.toLowerCase() === 'h') {
    e.preventDefault();
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
      window.location.href = 'index.html';
    }
  }

  // 'B' key goes to blog (if on home page)
  if (e.key.toLowerCase() === 'b' && (window.location.pathname === '/index.html' || window.location.pathname === '/')) {
    e.preventDefault();
    window.location.href = 'blog.html';
  }

  // 'M' key goes to operating manual (if on home page)
  if (e.key.toLowerCase() === 'm' && (window.location.pathname === '/index.html' || window.location.pathname === '/')) {
    e.preventDefault();
    window.open('operating-manual.html', '_blank');
  }
});

/** Fun Mode Toggle with Dual Wave Effect **/
const funToggle = document.getElementById("fun-toggle");
const body = document.body;
const banner = document.querySelector(".banner img");
const funModeSection = document.getElementById("fun-mode-section");

if (funToggle) {
  funToggle.addEventListener("change", function () {
    try {
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
    } catch (error) {
      debugError('Error toggling fun mode:', error);
    }
  });
}

/** Blog Functionality **/
async function loadBlogPosts(page = 1, searchQuery = '', append = false) {
  if (isLoading || (!hasMorePosts && append)) {
    debugLog('Skipping loadBlogPosts - isLoading:', isLoading, 'hasMorePosts:', hasMorePosts, 'append:', append);
    return;
  }
  
  try {
    isLoading = true;
    debugLog('Starting loadBlogPosts - page:', page, 'search:', searchQuery, 'append:', append);
    
    if (!window.fetchBlogPosts) {
      throw new Error('fetchBlogPosts function not available');
    }
    
    const result = await window.fetchBlogPosts(page, searchQuery);
    debugLog('fetchBlogPosts result:', result);
    
    if (!result || !result.posts || !result.pagination) {
      throw new Error('Invalid response from fetchBlogPosts');
    }
    
    const { posts, pagination } = result;
    
    debugLog('Received posts:', posts.length);
    debugLog('Pagination info:', pagination);
    
    // Update current page and search query
    currentPage = pagination.currentPage;
    currentSearchQuery = searchQuery;
    hasMorePosts = pagination.hasNextPage;
    
    // Get containers (use cached if available)
    const postList = getElement('.post-list', 'postList');
    const timeline = getElement('.timeline', 'timeline');
    
    debugLog('Containers found:', { 
      postList: postList ? 'found' : 'not found', 
      timeline: timeline ? 'found' : 'not found'
    });
    
    if (!postList || !timeline) {
      debugError('Required containers not found');
      return;
    }
    
    // Clear containers if not appending
    if (!append) {
      debugLog('Clearing containers');
      postList.innerHTML = '';
      timeline.innerHTML = '';
    }
    
    // Check if we have any posts to display
    if (!posts || posts.length === 0) {
      if (!append) {
        debugLog('No posts available, showing no posts message');
        showNoPostsMessage();
      }
      return;
    }
    
    // Process each post
    for (const post of posts) {
      debugLog('Processing post:', post.id || post.title);
      
      try {
        // Create and append post preview
        const preview = createPostPreview(post);
        postList.appendChild(preview);
        
        // Create and append blog post
        const blogPost = createBlogPost(post);
        timeline.appendChild(blogPost);
      } catch (error) {
        debugError('Error processing post:', error, post);
        // Continue with next post
      }
    }
    
    // Auto-expand the most recent post (first post) if not appending
    if (!append && posts.length > 0) {
      debugLog('Auto-expanding most recent post');
      
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
          
          debugLog('Most recent post auto-expanded');
        }
      }, 100);
    }
    
    debugLog('Finished processing posts');
  } catch (error) {
    debugError('Error in loadBlogPosts:', error);
    // Show no posts message on error
    if (!append) {
      showNoPostsMessage();
    }
  } finally {
    isLoading = false;
  }
}

function createPostPreview(post) {
  try {
    debugLog('Creating post preview:', post.id || post.title);
    const preview = document.createElement('div');
    preview.className = 'post-preview';
    preview.dataset.postId = post.id;
    
    // Sanitize title to prevent XSS
    const title = post.title || 'Untitled';
    const date = formatDate(post.date);
    const tags = (post.tags || []).map(tag => {
      const safeTag = String(tag).replace(/[<>]/g, '');
      return `<span class="post-tag clickable-tag" data-tag="${safeTag}">${safeTag}</span>`;
    }).join('');
    
    preview.innerHTML = `
      <h4>${title.replace(/[<>]/g, '')}</h4>
      <div class="post-date">${date}</div>
      <div class="post-tags">${tags}</div>
    `;
    
    // Add click handler to the entire preview
    preview.addEventListener('click', (e) => {
      // Don't trigger post selection if clicking on a tag
      if (e.target.classList.contains('clickable-tag')) {
        return;
      }
      
      debugLog('Post preview clicked:', post.title);
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
    
    // Add click handlers for tags
    const tagElements = preview.querySelectorAll('.clickable-tag');
    tagElements.forEach(tagElement => {
      tagElement.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent post selection
        const tag = e.target.dataset.tag;
        if (tag) {
          filterByTag(tag);
        }
      });
    });
    
    return preview;
  } catch (error) {
    debugError('Error creating post preview:', error);
    throw error;
  }
}

function createBlogPost(post) {
  try {
    debugLog('Creating blog post for:', post.id || post.title);
    const postElement = document.createElement('article');
    postElement.className = 'blog-post';
    postElement.dataset.postId = post.id;
    
    const title = document.createElement('h2');
    title.textContent = post.title || 'Untitled';
    
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
        tagSpan.className = 'post-tag clickable-tag';
        tagSpan.dataset.tag = String(tag);
        tagSpan.textContent = String(tag);
        tagSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          filterByTag(String(tag));
        });
        tags.appendChild(tagSpan);
      });
    }
    
    meta.appendChild(date);
    meta.appendChild(tags);
    
    const content = document.createElement('div');
    content.className = 'post-content collapsed';
    content.innerHTML = post.content || '';
    
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Show More';
    
    expandButton.addEventListener('click', (e) => {
      debugLog('Expand button clicked for post:', post.id);
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
    
    // Create like/dislike section
    const interactionSection = document.createElement('div');
    interactionSection.className = 'post-interactions';
    
    // Get current stats
    const stats = window.blogAnalytics ? window.blogAnalytics.getStats(post.id) : { likes: 0, dislikes: 0 };
    const userVote = window.blogAnalytics ? window.blogAnalytics.getUserVote(post.id) : null;
    
    interactionSection.innerHTML = `
      <div class="interaction-buttons">
        <button class="like-button ${userVote === 'like' ? 'active' : ''}" data-post-id="${post.id}">
          👍 <span class="like-count">${stats.likes || 0}</span>
        </button>
        <button class="dislike-button ${userVote === 'dislike' ? 'active' : ''}" data-post-id="${post.id}">
          👎 <span class="dislike-count">${stats.dislikes || 0}</span>
        </button>
      </div>
    `;
    
    // Add event listeners for like/dislike buttons
    const likeButton = interactionSection.querySelector('.like-button');
    const dislikeButton = interactionSection.querySelector('.dislike-button');
    
    if (likeButton) {
      likeButton.addEventListener('click', () => {
        if (window.blogAnalytics) {
          try {
            const newStats = window.blogAnalytics.addInteraction(post.id, 'like');
            updateInteractionButtons(post.id, newStats);
          } catch (error) {
            debugError('Error adding like:', error);
          }
        }
      });
    }
    
    if (dislikeButton) {
      dislikeButton.addEventListener('click', () => {
        if (window.blogAnalytics) {
          try {
            const newStats = window.blogAnalytics.addInteraction(post.id, 'dislike');
            updateInteractionButtons(post.id, newStats);
          } catch (error) {
            debugError('Error adding dislike:', error);
          }
        }
      });
    }
    
    postElement.appendChild(title);
    postElement.appendChild(meta);
    postElement.appendChild(content);
    postElement.appendChild(interactionSection);
    postElement.appendChild(expandButton);
    
    debugLog('Created blog post element:', postElement);
    return postElement;
  } catch (error) {
    debugError('Error creating blog post:', error);
    throw error;
  }
}

function formatDate(dateString) {
  try {
    if (!dateString) return 'No date';
    
    // Create date object and adjust for timezone
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
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
  } catch (error) {
    debugError('Error formatting date:', error);
    return 'Invalid date';
  }
}

// Helper function to update interaction buttons
function updateInteractionButtons(postId, stats) {
  try {
    const postElement = document.querySelector(`.blog-post[data-post-id="${postId}"]`);
    if (!postElement) {
      debugError('Could not find blog post element for ID:', postId);
      return;
    }
    
    const likeButton = postElement.querySelector('.like-button');
    const dislikeButton = postElement.querySelector('.dislike-button');
    const likeCount = postElement.querySelector('.like-count');
    const dislikeCount = postElement.querySelector('.dislike-count');
    
    if (!likeButton || !dislikeButton || !likeCount || !dislikeCount) {
      debugError('Could not find interaction elements for post:', postId);
      return;
    }
    
    // Update counts
    likeCount.textContent = stats.likes || 0;
    dislikeCount.textContent = stats.dislikes || 0;
    
    // Update active states
    if (window.blogAnalytics) {
      const userVote = window.blogAnalytics.getUserVote(postId);
      likeButton.classList.toggle('active', userVote === 'like');
      dislikeButton.classList.toggle('active', userVote === 'dislike');
    }
  } catch (error) {
    debugError('Error updating interaction buttons:', error);
  }
}

// Filter posts by tag
function filterByTag(tag) {
  try {
    debugLog('Filtering by tag:', tag);
    
    if (!tag) {
      debugError('No tag provided to filterByTag');
      return;
    }
    
    // Update search input to show the tag
    const searchInput = getElement('#search-input', 'searchInput');
    if (searchInput) {
      searchInput.value = `#${tag}`;
    }
    
    // Show active tag indicator
    showActiveFilter(`Tag: ${tag}`);
    
    // Reset pagination and load posts with tag filter
    currentPage = 1;
    hasMorePosts = true;
    loadBlogPosts(1, tag).catch(error => {
      debugError('Error filtering by tag:', error);
    });
  } catch (error) {
    debugError('Error in filterByTag:', error);
  }
}

// Show active filter indicator
function showActiveFilter(filterText) {
  try {
    // Remove any existing filter indicator
    const existingIndicator = document.querySelector('.active-filter');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // Create new filter indicator
    const indicator = document.createElement('div');
    indicator.className = 'active-filter';
    indicator.innerHTML = `
      <span class="filter-text">${String(filterText).replace(/[<>]/g, '')}</span>
      <button class="clear-filter" onclick="clearFilter()">✕</button>
    `;
    
    // Insert after search container
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.insertAdjacentElement('afterend', indicator);
    }
  } catch (error) {
    debugError('Error showing active filter:', error);
  }
}

// Clear active filter
function clearFilter() {
  try {
    // Remove filter indicator
    const indicator = document.querySelector('.active-filter');
    if (indicator) {
      indicator.remove();
    }
    
    // Clear search input
    const searchInput = getElement('#search-input', 'searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Reset and reload all posts
    currentPage = 1;
    hasMorePosts = true;
    currentSearchQuery = '';
    loadBlogPosts(1, '').catch(error => {
      debugError('Error clearing filter:', error);
    });
  } catch (error) {
    debugError('Error clearing filter:', error);
  }
}

// Enhanced search function
function performSearch() {
  try {
    const searchInput = getElement('#search-input', 'searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    
    // Check if it's a tag search (starts with #)
    if (query.startsWith('#')) {
      const tag = query.substring(1);
      if (tag) {
        filterByTag(tag);
        return;
      }
    }
    
    // Regular search
    if (query !== currentSearchQuery) {
      if (query) {
        showActiveFilter(`Search: "${query}"`);
      } else {
        clearFilter();
      }
      
      currentPage = 1;
      hasMorePosts = true;
      loadBlogPosts(1, query).catch(error => {
        debugError('Error performing search:', error);
      });
    }
  } catch (error) {
    debugError('Error in performSearch:', error);
  }
}
