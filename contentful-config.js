// Contentful API Configuration
const contentfulConfig = {
    space: 'sapssgguac2u',
    deliveryToken: 'VqrUc-rft1ShXcch0N5oa3uVKeFfJAGLeKCSEARPyHg',
    previewToken: 'ARZCwfccwWDxDbUpVZvq2FU6A982LoeMqddYdKnpwr4',
    environment: 'master',
    postsPerPage: 3
};

// Debug mode - set to false for production
const DEBUG = typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');

// Debug logging helper
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

function debugError(...args) {
    console.error(...args); // Always log errors
}

// Function to check if environment variables are properly set
function checkConfig() {
    debugLog('Checking configuration...');
    debugLog('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server');
    
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== '127.0.0.1' && window.location.hostname !== 'localhost';
    debugLog('Environment:', isProduction ? 'Production' : 'Development');
    
    debugLog('Current config values:', {
        space: contentfulConfig.space,
        deliveryToken: contentfulConfig.deliveryToken ? contentfulConfig.deliveryToken.substring(0, 10) + '...' : 'missing',
        previewToken: contentfulConfig.previewToken ? contentfulConfig.previewToken.substring(0, 10) + '...' : 'missing'
    });
    
    const missingVars = [];
    if (contentfulConfig.space === 'CONTENTFUL_SPACE_ID') missingVars.push('SPACE_ID');
    if (contentfulConfig.deliveryToken === 'CONTENTFUL_DELIVERY_TOKEN') missingVars.push('DELIVERY_TOKEN');
    if (contentfulConfig.previewToken === 'CONTENTFUL_PREVIEW_TOKEN') missingVars.push('PREVIEW_TOKEN');
    
    if (missingVars.length > 0) {
        debugError('Missing or invalid environment variables:', missingVars.join(', '));
        return false;
    }
    return true;
}

// Function to initialize the configuration
async function initializeConfig() {
    debugLog('Initializing configuration...');
    
    // Check if we're in development mode
    if (typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) {
        try {
            // Try to load the local development config first
            let devConfig;
            try {
                devConfig = await import('./contentful-config.dev.local.js');
                debugLog('Using local development configuration');
            } catch (error) {
                // Fallback to the template dev config
                devConfig = await import('./contentful-config.dev.js');
                debugLog('Using template development configuration');
            }
            Object.assign(contentfulConfig, devConfig.contentfulConfig);
        } catch (error) {
            debugError('Development configuration not found. Using placeholder values.');
        }
    }
    
    if (!checkConfig()) {
        debugError('Configuration is invalid. Using fallback posts.');
        return contentfulConfig;
    }
    
    debugLog('Contentful config loaded successfully');
    return contentfulConfig;
}

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
        debugLog('Starting fetchBlogPosts...');
        
        if (!checkConfig()) {
            debugError('Invalid configuration, no posts available');
            return {
                posts: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalPosts: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            };
        }
        
        debugLog('Config:', {
            space: contentfulConfig.space,
            environment: contentfulConfig.environment,
            postsPerPage: contentfulConfig.postsPerPage
        });
        
        // First, let's check what content types are available
        const typesUrl = `https://cdn.contentful.com/spaces/${contentfulConfig.space}/environments/${contentfulConfig.environment}/content_types?access_token=${contentfulConfig.deliveryToken}`;
        debugLog('Checking content types at:', typesUrl);
        
        const typesResponse = await fetch(typesUrl);
        if (!typesResponse.ok) {
            debugError('Failed to fetch content types:', typesResponse.status, typesResponse.statusText);
            return {
                posts: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalPosts: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            };
        }
        
        const typesData = await typesResponse.json();
        if (!typesData || !typesData.items) {
            debugError('Invalid response from Contentful:', typesData);
            return {
                posts: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalPosts: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            };
        }
        
        debugLog('Available content types:', typesData.items.map(type => type.sys.id));
        
        // Use the first content type that contains 'post' or 'blog' in its name
        const postContentType = typesData.items.find(type => 
            type.sys.id.toLowerCase().includes('post') || 
            type.sys.id.toLowerCase().includes('blog')
        );
        
        debugLog('Looking for content types containing "post" or "blog"');
        debugLog('Found content type:', postContentType ? postContentType.sys.id : 'None');
        
        if (!postContentType) {
            debugLog('No suitable content type found');
            debugLog('Available types:', typesData.items.map(type => type.sys.id).join(', '));
            return {
                posts: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalPosts: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            };
        }
        
        debugLog('Using content type:', postContentType.sys.id);
        
        // Calculate skip value for pagination
        const skip = (page - 1) * contentfulConfig.postsPerPage;
        
        // Build the query URL with the correct content type
        let url = `https://cdn.contentful.com/spaces/${contentfulConfig.space}/environments/${contentfulConfig.environment}/entries?access_token=${contentfulConfig.deliveryToken}&content_type=${postContentType.sys.id}&include=2&limit=${contentfulConfig.postsPerPage}&skip=${skip}&order=-sys.createdAt`;
        
        debugLog('Making API request to:', url);
        
        // Add search query if provided
        if (searchQuery) {
            url += `&query=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await fetch(url);
        debugLog('API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            debugError('API Error response:', errorText);
            throw new Error(`Failed to fetch blog posts: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        debugLog('API Response data:', {
            total: data.total,
            skip: data.skip,
            limit: data.limit,
            items: data.items ? data.items.length : 0
        });
        
        if (!data.items || data.items.length === 0) {
            debugLog('No posts found in Contentful');
            return {
                posts: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalPosts: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            };
        }
        
        // Get total number of posts for pagination
        const totalPosts = data.total;
        const totalPages = Math.ceil(totalPosts / contentfulConfig.postsPerPage);
        
        debugLog('Processing posts...');
        // Transform Contentful data to match your existing blog post structure
        const posts = await Promise.all(data.items.map(async item => {
            const fields = item.fields;
            debugLog('Processing post:', {
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

        debugLog('Successfully processed posts:', posts.length);
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
        debugError('Error in fetchBlogPosts:', error);
        debugError('Error stack:', error.stack);
        return {
            posts: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalPosts: 0,
                hasNextPage: false,
                hasPreviousPage: false
            }
        };
    }
}

// Export everything as a default export
export default {
    contentfulConfig,
    initializeConfig,
    fetchBlogPosts
};

// Also make fetchBlogPosts available globally for non-module scripts
window.fetchBlogPosts = fetchBlogPosts; 