// Contentful API Configuration
const contentfulConfig = {
    space: 'sapssgguac2u', // Your Space ID
    accessToken: 'poLEYV3o7FAQyan1Si-fBPEglPEg4gTYns6xvyoLSX8', // Your Content Delivery API access token
    environment: 'master',
    postsPerPage: 3 // Changed to 3 posts per page
};

console.log('Contentful config loaded');

// Function to resolve rich text references
async function resolveRichTextReferences(richText) {
    if (!richText || !richText.content) return '';
    
    let html = '';
    for (const node of richText.content) {
        switch (node.nodeType) {
            case 'paragraph':
                html += '<p>' + processNodeContent(node) + '</p>';
                break;
            case 'heading-1':
                html += '<h1>' + processNodeContent(node) + '</h1>';
                break;
            case 'heading-2':
                html += '<h2>' + processNodeContent(node) + '</h2>';
                break;
            case 'heading-3':
                html += '<h3>' + processNodeContent(node) + '</h3>';
                break;
            case 'heading-4':
                html += '<h4>' + processNodeContent(node) + '</h4>';
                break;
            case 'heading-5':
                html += '<h5>' + processNodeContent(node) + '</h5>';
                break;
            case 'heading-6':
                html += '<h6>' + processNodeContent(node) + '</h6>';
                break;
            case 'ordered-list':
                html += '<ol>' + processListItems(node) + '</ol>';
                break;
            case 'unordered-list':
                html += '<ul>' + processListItems(node) + '</ul>';
                break;
            case 'blockquote':
                html += '<blockquote>' + processNodeContent(node) + '</blockquote>';
                break;
            case 'hr':
                html += '<hr>';
                break;
            case 'embedded-asset-block':
                if (node.data && node.data.target) {
                    const asset = node.data.target;
                    if (asset.fields && asset.fields.file) {
                        const url = `https:${asset.fields.file.url}`;
                        const alt = asset.fields.title || '';
                        html += `<figure><img src="${url}" alt="${alt}" loading="lazy"><figcaption>${asset.fields.description || ''}</figcaption></figure>`;
                    }
                }
                break;
            case 'table':
                html += processTable(node);
                break;
        }
    }
    return html;
}

// Helper function to process node content with marks
function processNodeContent(node) {
    if (!node.content) return '';
    
    let content = '';
    for (const item of node.content) {
        if (item.nodeType === 'text') {
            let text = item.value;
            if (item.marks) {
                for (const mark of item.marks) {
                    switch (mark.type) {
                        case 'bold':
                            text = `<strong>${text}</strong>`;
                            break;
                        case 'italic':
                            text = `<em>${text}</em>`;
                            break;
                        case 'underline':
                            text = `<u>${text}</u>`;
                            break;
                        case 'code':
                            text = `<code>${text}</code>`;
                            break;
                        case 'superscript':
                            text = `<sup>${text}</sup>`;
                            break;
                        case 'subscript':
                            text = `<sub>${text}</sub>`;
                            break;
                        case 'strikethrough':
                            text = `<s>${text}</s>`;
                            break;
                    }
                }
            }
            content += text;
        } else if (item.nodeType === 'hyperlink') {
            const url = item.data.uri;
            content += `<a href="${url}" target="_blank" rel="noopener noreferrer">${processNodeContent(item)}</a>`;
        }
    }
    return content;
}

// Helper function to process list items
function processListItems(node) {
    if (!node.content) return '';
    
    let items = '';
    for (const item of node.content) {
        if (item.nodeType === 'list-item') {
            items += '<li>' + processNodeContent(item) + '</li>';
        }
    }
    return items;
}

// Helper function to process tables
function processTable(node) {
    if (!node.content) return '';
    
    let table = '<table>';
    for (const row of node.content) {
        if (row.nodeType === 'table-row') {
            table += '<tr>';
            for (const cell of row.content) {
                const tag = cell.nodeType === 'table-header-cell' ? 'th' : 'td';
                table += `<${tag}>${processNodeContent(cell)}</${tag}>`;
            }
            table += '</tr>';
        }
    }
    table += '</table>';
    return table;
}

// Function to get image URL
function getImageUrl(image) {
    if (!image || !image.fields || !image.fields.file) return null;
    return `https:${image.fields.file.url}`;
}

// Function to fetch blog posts from Contentful with pagination
async function fetchBlogPosts(page = 1, searchQuery = '') {
    try {
        console.log('Starting fetchBlogPosts...');
        console.log('Config:', {
            space: contentfulConfig.space,
            environment: contentfulConfig.environment,
            postsPerPage: contentfulConfig.postsPerPage
        });
        
        // Calculate skip value for pagination
        const skip = (page - 1) * contentfulConfig.postsPerPage;
        
        // Build the query URL
        let url = `https://cdn.contentful.com/spaces/${contentfulConfig.space}/environments/${contentfulConfig.environment}/entries?access_token=${contentfulConfig.accessToken}&content_type=microBlogPost&include=2&limit=${contentfulConfig.postsPerPage}&skip=${skip}&order=-sys.createdAt`;
        
        console.log('Making API request to:', url);
        
        // Add search query if provided
        if (searchQuery) {
            url += `&query=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await fetch(url);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error response:', errorText);
            throw new Error(`Failed to fetch blog posts: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        console.log('API Response data:', {
            total: data.total,
            skip: data.skip,
            limit: data.limit,
            items: data.items ? data.items.length : 0
        });
        
        if (!data.items || data.items.length === 0) {
            console.log('No posts found. Checking content types...');
            // Let's check what content types are available
            const typesUrl = `https://cdn.contentful.com/spaces/${contentfulConfig.space}/environments/${contentfulConfig.environment}/content_types?access_token=${contentfulConfig.accessToken}`;
            console.log('Checking content types at:', typesUrl);
            const typesResponse = await fetch(typesUrl);
            const typesData = await typesResponse.json();
            console.log('Available content types:', typesData.items.map(type => type.sys.id));
            return {
                posts: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalPosts: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            };
        }
        
        // Get total number of posts for pagination
        const totalPosts = data.total;
        const totalPages = Math.ceil(totalPosts / contentfulConfig.postsPerPage);
        
        console.log('Processing posts...');
        // Transform Contentful data to match your existing blog post structure
        const posts = await Promise.all(data.items.map(async item => {
            const fields = item.fields;
            console.log('Processing post:', {
                id: item.sys.id,
                title: fields.title,
                contentType: item.sys.contentType.sys.id
            });
            
            // Handle rich text content
            let content = '';
            if (fields.content) {
                content = await resolveRichTextReferences(fields.content);
            }

            // Handle featured image
            let featuredImage = null;
            if (fields.featuredImage) {
                featuredImage = getImageUrl(fields.featuredImage);
            }

            const post = {
                id: item.sys.id,
                title: fields.title,
                shortTitle: fields.shortTitle,
                date: fields.date,
                tags: fields.tags || [],
                content: content,
                featuredImage: featuredImage
            };
            
            return post;
        }));

        console.log('Successfully processed posts:', posts.length);
        return {
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    } catch (error) {
        console.error('Error in fetchBlogPosts:', error);
        console.error('Error stack:', error.stack);
        return {
            posts: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalPosts: 0,
                hasNextPage: false,
                hasPreviousPage: false
            }
        };
    }
}

// Make the functions available globally
window.fetchBlogPosts = fetchBlogPosts; 