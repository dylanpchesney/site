let posts = []; // Declare posts as a global variable

// Fetch posts.json and handle the data
fetch('posts.json')
  .then(response => response.json())
  .then(data => {
    posts = data; // Assign fetched posts to the global posts variable
    console.log(posts); // Check if posts are correctly fetched
    loadPosts(); // Load the posts once data is fetched
  })
  .catch(error => console.error('Error loading posts:', error));

// Load posts into the sidebar
function loadPosts() {
    const postList = document.getElementById('postList');
    posts.forEach(post => {
        const listItem = document.createElement('li');
        
        // Create a container for the title and date
        const postContainer = document.createElement('div');
        postContainer.classList.add('post-container');
        
        // Create the title element
        const postTitle = document.createElement('h3');
        postTitle.classList.add('post-title');
        postTitle.textContent = post.title;
        
        // Create the date element
        const postDate = document.createElement('p');
        postDate.classList.add('post-date');
        postDate.textContent = `${post.date}`;
        
        // Append the title and date to the post container
        postContainer.appendChild(postTitle);
        postContainer.appendChild(postDate);
        
        // Create a link for the post
        const link = document.createElement('a');
        link.href = "#";
        link.appendChild(postContainer);
        link.onclick = function() {
            displayPost(post.id); // When a post is clicked, display it
        };
        
        // Append the link to the list item
        listItem.appendChild(link);
        postList.appendChild(listItem);
    });
}

// Display the content of a selected post
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

// Search functionality for filtering posts
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

// Load posts once the page is ready
window.onload = function() {
    if (posts.length === 0) {
        loadPosts(); // Only load posts if the posts array is still empty
    }
};