// Simple Blog Analytics without external dependencies
// Uses localStorage for demo - can be upgraded to Firebase later

class BlogAnalytics {
    constructor() {
        this.storageKey = 'blog-post-interactions';
        this.interactions = this.loadInteractions();
    }
    
    loadInteractions() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.log('Error loading interactions:', error);
            return {};
        }
    }
    
    saveInteractions() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.interactions));
        } catch (error) {
            console.log('Error saving interactions:', error);
        }
    }
    
    hasUserInteracted(postId) {
        return this.interactions[postId]?.userVoted || false;
    }
    
    getUserVote(postId) {
        return this.interactions[postId]?.userVote || null;
    }
    
    addInteraction(postId, type) {
        if (!this.interactions[postId]) {
            this.interactions[postId] = {
                likes: Math.floor(Math.random() * 15) + 3, // Start with some random likes
                dislikes: Math.floor(Math.random() * 3),
                userVoted: false,
                userVote: null
            };
        }
        
        const post = this.interactions[postId];
        
        // If user already voted, remove previous vote
        if (post.userVoted && post.userVote) {
            if (post.userVote === 'like') {
                post.likes = Math.max(0, post.likes - 1);
            } else if (post.userVote === 'dislike') {
                post.dislikes = Math.max(0, post.dislikes - 1);
            }
        }
        
        // Add new vote if different from current, or remove if same
        if (post.userVote === type) {
            // User clicked same button - remove vote
            post.userVoted = false;
            post.userVote = null;
        } else {
            // User clicked different button or first vote
            if (type === 'like') {
                post.likes += 1;
            } else if (type === 'dislike') {
                post.dislikes += 1;
            }
            post.userVoted = true;
            post.userVote = type;
        }
        
        this.saveInteractions();
        return post;
    }
    
    getStats(postId) {
        if (!this.interactions[postId]) {
            // Return some initial random stats for new posts
            this.interactions[postId] = {
                likes: Math.floor(Math.random() * 15) + 3,
                dislikes: Math.floor(Math.random() * 3),
                userVoted: false,
                userVote: null
            };
            this.saveInteractions();
        }
        return this.interactions[postId];
    }
}

// Create global analytics instance
window.blogAnalytics = new BlogAnalytics(); 