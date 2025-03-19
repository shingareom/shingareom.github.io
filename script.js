document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const body = document.body;

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');
        
        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                if (nav.classList.contains('nav-active')) {
                    nav.classList.remove('nav-active');
                    burger.classList.remove('toggle');
                    navLinks.forEach(link => {
                        link.style.animation = '';
                    });
                }
                
                // Scroll to the element
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Modal functionality
    const modal = document.getElementById('post-modal');
    const modalContent = document.getElementById('modal-content-container');
    const closeModalBtn = document.querySelector('.close-modal');

    // Close modal when clicking on X
    closeModalBtn.addEventListener('click', () => {
        closeModal();
    });

    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Escape key to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function openModal(content) {
        modalContent.innerHTML = content;
        modal.classList.add('active');
        body.classList.add('modal-open');
    }

    function closeModal() {
        modal.classList.remove('active');
        body.classList.remove('modal-open');
        setTimeout(() => {
            modalContent.innerHTML = '';
        }, 300);
    }

    // Fetch and display blog posts
    fetchData('data.json')
        .then(data => {
            displayBlogPosts(data.blogPosts);
            displayQuotes(data.quotes);
            displayPortfolio(data.portfolioItems);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('blog-grid').innerHTML = `
                <div class="error-message">
                    <p>Failed to load blog posts. Please try again later.</p>
                </div>
            `;
        });

    // Function to fetch data from JSON
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    // Display blog posts from JSON data
    function displayBlogPosts(posts) {
        const blogGrid = document.getElementById('blog-grid');
        
        if (!posts || posts.length === 0) {
            blogGrid.innerHTML = '<p>No blog posts found.</p>';
            return;
        }
        
        let blogHTML = '';
        
        posts.forEach(post => {
            blogHTML += `
                <article class="blog-card" data-post-id="${post.id}">
                    ${post.image ? `<img src="${post.image}" alt="${post.title}" class="blog-image">` : ''}
                    <div class="blog-content">
                        <h3>${post.title}</h3>
                        <div class="blog-meta">
                            <span class="date">${formatDate(post.date)}</span>
                            <span class="blog-category">${post.category}</span>
                        </div>
                        <p class="blog-excerpt">${post.excerpt}</p>
                        <a href="#" class="read-more" data-post-id="${post.id}">Read More</a>
                    </div>
                </article>
            `;
        });
        
        blogGrid.innerHTML = blogHTML;
        
        // Add event listeners to "Read More" buttons
        document.querySelectorAll('.read-more').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = button.getAttribute('data-post-id');
                const post = posts.find(p => p.id === parseInt(postId));
                
                if (post) {
                    const postHTML = generatePostHTML(post);
                    openModal(postHTML);
                }
            });
        });
    }

    // Display quotes from JSON data
    function displayQuotes(quotes) {
        const quotesContainer = document.getElementById('quotes-container');
        
        if (!quotes || quotes.length === 0) {
            quotesContainer.innerHTML = '<p>No quotes found.</p>';
            return;
        }
        
        let quotesHTML = '';
        
        quotes.forEach(quote => {
            quotesHTML += `
                <div class="quote">
                    <p>${quote.text}</p>
                </div>
            `;
        });
        
        quotesContainer.innerHTML = quotesHTML;
    }

    // Display portfolio items from JSON data
    function displayPortfolio(items) {
        const portfolioGrid = document.getElementById('portfolio-grid');
        
        if (!items || items.length === 0) {
            portfolioGrid.innerHTML = '<p>No portfolio items found.</p>';
            return;
        }
        
        let portfolioHTML = '';
        
        items.forEach(item => {
            portfolioHTML += `
                <div class="portfolio-item">
                    <img src="${item.image}" alt="${item.title}" class="portfolio-image">
                    <div class="portfolio-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        ${item.link ? `<a href="${item.link}" class="portfolio-link" target="_blank" rel="noopener noreferrer">${item.linkText || 'View Project'}</a>` : ''}
                    </div>
                </div>
            `;
        });
        
        portfolioGrid.innerHTML = portfolioHTML;
    }

    // Generate full blog post HTML for modal
    function generatePostHTML(post) {
        return `
            <article class="blog-post">
                <div class="post-header">
                    <h2 class="post-title">${post.title}</h2>
                    <div class="post-meta">
                        <span class="date">${formatDate(post.date)}</span>
                        <span class="category">${post.category}</span>
                    </div>
                </div>
                
                ${post.fullImage ? `<img src="${post.fullImage}" alt="${post.title}" class="post-image">` : ''}
                
                <div class="post-content">
                    ${formatContent(post.content)}
                </div>
            </article>
        `;
    }

    // Format blog content with formatting
    function formatContent(content) {
        if (!content) return '';
        
        // Process content sections
        if (Array.isArray(content)) {
            return content.map(section => {
                switch (section.type) {
                    case 'paragraph':
                        return `<p>${section.text}</p>`;
                    case 'heading':
                        return `<h${section.level}>${section.text}</h${section.level}>`;
                    case 'image':
                        return `<img src="${section.url}" alt="${section.caption || ''}" 
                                ${section.caption ? `title="${section.caption}"` : ''}>
                                ${section.caption ? `<p class="image-caption">${section.caption}</p>` : ''}`;
                    case 'quote':
                        return `<blockquote><p>${section.text}</p></blockquote>`;
                    case 'list':
                        const listType = section.ordered ? 'ol' : 'ul';
                        const items = section.items.map(item => `<li>${item}</li>`).join('');
                        return `<${listType}>${items}</${listType}>`;
                    default:
                        return `<p>${section.text || ''}</p>`;
                }
            }).join('');
        }
        
        // If content is just a string
        return `<p>${content}</p>`;
    }

    // Format dates for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }
}); 