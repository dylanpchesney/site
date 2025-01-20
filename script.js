fetch('posts.json')
  .then(response => response.json())
  .then(posts => {
    console.log(posts); // Check if posts are correctly fetched
    displayPosts(posts); // Add this to handle displaying posts on the page
  })
  .catch(error => console.error('Error loading posts:', error));
function loadPosts() {
    const postList = document.getElementById('postList');
    posts.forEach(post => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = "#";
      link.textContent = `${post.title} - ${post.date}`;
      link.onclick = function() {
        displayPost(post.id);
      };
      listItem.appendChild(link);
      postList.appendChild(listItem);
    });
  }
  
  // Display the selected post content
  function displayPost(postId) {
    const post = posts.find(p => p.id === postId);
    const postContent = document.getElementById('postContent');
    postContent.innerHTML = `
      <h2>${post.title}</h2>
      <p><strong>Published:</strong> ${post.date}</p>
      <p><strong>Tags:</strong> ${post.tags.join(', ')}</p>
      <p>${post.content}</p>
    `;
  }
  
  // Search functionality
  function searchPosts() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const filteredPosts = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) || post.content.toLowerCase().includes(searchTerm)
    );
    
    const postList = document.getElementById('postList');
    postList.innerHTML = ''; // Clear current list
    
    filteredPosts.forEach(post => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = "#";
      link.textContent = `${post.title} - ${post.date}`;
      link.onclick = function() {
        displayPost(post.id);
      };
      listItem.appendChild(link);
      postList.appendChild(listItem);
    });
  }
  // Load posts when the page is ready
  window.onload = loadPosts;