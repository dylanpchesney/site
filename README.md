# Dylan Chesney's Personal Website

A modern personal website with an integrated blog powered by Contentful CMS.

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Dynamic Blog**: Blog posts managed through Contentful CMS
- **Search Functionality**: Search through blog posts by title, content, or tags
- **Infinite Scroll**: Automatically loads more posts as you scroll
- **Fallback System**: Local blog posts display when Contentful is unavailable
- **Fun Mode**: Interactive theme toggle with animations

## Local Development Setup

### Prerequisites
- A modern web browser
- A local web server (like Live Server for VS Code)

### Contentful Setup

1. **Copy the development config template:**
   ```bash
   cp contentful-config.dev.js contentful-config.dev.local.js
   ```

2. **Add your Contentful API keys to `contentful-config.dev.local.js`:**
   ```javascript
   export const contentfulConfig = {
       space: 'your-contentful-space-id',
       deliveryToken: 'your-contentful-delivery-token',
       previewToken: 'your-contentful-preview-token',
       environment: 'master',
       postsPerPage: 3
   };
   ```

3. **Start your local server** (e.g., using Live Server in VS Code)

### Content Structure in Contentful

Your Contentful space should have a content type for blog posts with these fields:
- `title` (Short Text)
- `shortTitle` (Short Text, optional)
- `date` (Date & Time)
- `tags` (Short Text, list)
- `content` (Rich Text)
- `featuredImage` (Media, optional)

## Production Deployment

This site is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Setting up GitHub Secrets

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add these repository secrets:
   - `CONTENTFUL_SPACE_ID`: Your Contentful space ID
   - `CONTENTFUL_DELIVERY_TOKEN`: Your Contentful delivery token
   - `CONTENTFUL_PREVIEW_TOKEN`: Your Contentful preview token

### Deployment Process

1. Push changes to the `main` branch
2. GitHub Actions will automatically:
   - Replace placeholder values with real API keys
   - Deploy the site to GitHub Pages
   - Your blog posts will be fetched securely from Contentful

## File Structure

```
├── index.html              # Homepage
├── blog.html              # Blog page
├── style.css              # All styles
├── script.js              # Main JavaScript functionality
├── contentful-config.js   # Contentful configuration (production)
├── contentful-config.dev.local.js  # Development config (not in git)
├── blog-posts.js          # Fallback blog posts
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions deployment
└── images/                # Site images
```

## Security Notes

- **Never commit real API keys to the repository**
- `contentful-config.dev.local.js` is ignored by Git to protect your keys
- Production API keys are stored securely in GitHub Secrets
- The site gracefully falls back to local posts if Contentful is unavailable

## Troubleshooting

### Blog posts not loading locally
1. Ensure you've created `contentful-config.dev.local.js` with valid API keys
2. Check browser console for error messages
3. Verify your Contentful space has the correct content type structure

### GitHub Actions deployment failing
1. Verify all three secrets are set in repository settings
2. Check the Actions tab for detailed error logs
3. Ensure your Contentful tokens have the correct permissions

### Fallback posts showing instead of Contentful posts
1. Check browser console for API errors
2. Verify your Contentful space ID and tokens are correct
3. Ensure your content type includes 'post' or 'blog' in its name

## Technologies Used

- **HTML5 & CSS3**: Modern web standards
- **Vanilla JavaScript**: No frameworks, just clean code
- **Contentful CMS**: Headless content management
- **GitHub Pages**: Free hosting with custom domain support
- **GitHub Actions**: Automated deployment with secret management
