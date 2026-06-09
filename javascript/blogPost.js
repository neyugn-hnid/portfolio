'use strict';

export class BlogPost {
  constructor() {
    this.domain = 'https://blog.kunkey.dev';
  }
  async getPosts(limit = 10) {
    const response = await fetch(`${this.domain}/api/posts/latest?limit=${limit}`);
    const data = await response.json();
    return data;
  }
  renderPosts(posts) {
    const postsContainer = document.querySelector('.posts-container');
    postsContainer.innerHTML = ''; // Clear existing content
    if (posts?.status && posts?.data?.length > 0) {
        // console.log(posts);
        posts.data.forEach(post => {
            const postElement = this.createPostCard(post);
            postsContainer.appendChild(postElement);
          });   
        
        // Initialize Swiper after posts are rendered
        this.initSwiper();
    }
  }

  initSwiper() {
    // Wait for DOM to be ready
    setTimeout(() => {
      const swiper = new Swiper('.blog-swiper', {
        // Responsive breakpoints
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
          delay: 52000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.blog-swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.blog-swiper-button-next',
          prevEl: '.blog-swiper-button-prev',
        },
        breakpoints: {
          // Mobile: 1 slide
          320: {
            slidesPerView: 1,
            spaceBetween: 30,
          },
          // Tablet: 2 slides
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          // Desktop: 3 slides
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        },
        // Additional options
        grabCursor: true,
        keyboard: {
          enabled: true,
        },
        mousewheel: {
          forceToAxis: true,
        },
        // Fix spacing issues
        centeredSlides: false,
        centeredSlidesBounds: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        // Use spaceBetween instead of margin
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        // Update on resize and slide change
        on: {
          init: function () {
            // this.update();
            this.updateSize();
            this.updateSlides();
            // Force remove margin from slides
            this.slides.forEach(slide => {
              slide.style.marginRight = '0px';
              slide.style.marginLeft = '0px';
            });
          },
          resize: function () {
            // this.update();
            this.updateSize();
            this.updateSlides();
          },
          slideChange: function () {
            // this.update();
            // Force remove margin from slides
            this.slides.forEach(slide => {
              slide.style.marginRight = '0px';
              slide.style.marginLeft = '0px';
            });
          },
          slideChangeTransitionEnd: function () {
            // this.update();
            // Force remove margin from slides
            this.slides.forEach(slide => {
              slide.style.marginRight = '0px';
              slide.style.marginLeft = '0px';
            });
          }
        }
      });
    }, 100);
  }

  createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card swiper-slide fromBottom';
    
    // Extract data from post
    const title = post.title || 'Untitled';
    const excerpt = post.description || 'No description available';
    const featuredImage = post.media ? 
                         `${this.domain}/uploads/${post.media}` : 
                         'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Blog+Post';
    const author = post.author?.name || 'Unknown Author';
    const authorAvatar = this.domain + '/images/1730360781.jpg';
    const date = new Date(post.created_at).toLocaleDateString('vi-VN');
    const link = `${this.domain}/posts/${post.slug}`;
    
    // Get category based on tag ID
    const category = this.getCategoryByTagId(post.tags?.[0]?.id);
    const categoryColor = this.getCategoryColor(category);
    
    // Clean HTML from excerpt
    const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '').substring(0, 120) + '...';
    
    card.innerHTML = `
      <div class="blog-card__image-container" onclick="window.open('${link}', '_blank')">
        <div class="blog-card__category" style="background-color: ${categoryColor}">
          ${category}
        </div>
        <img src="${featuredImage}" alt="${title}" class="blog-card__image" loading="lazy" />
        <div class="blog-card__meta">
          <span class="blog-card__date">
            <i class="fa-solid fa-clock"></i>
            ${this.getTimeAgo(post.created_at)}
          </span>
          <span class="blog-card__views">
            <i class="fa-solid fa-eye"></i>
            ${post.content_count || Math.floor(Math.random() * 1000) + 10}
          </span>
        </div>
      </div>
      <div class="blog-card__content">
        <h3 class="blog-card__title">${title}</h3>
        <p class="blog-card__excerpt">${cleanExcerpt}</p>
        <div class="blog-card__author">
          <img src="${authorAvatar}" alt="${author}" class="blog-card__author-avatar" />
          <span class="blog-card__author-name">${author}</span>
          <i class="fa-solid fa-check-circle blog-card__verified"></i>
          <span class="blog-card__likes">
            <i class="fa-solid fa-heart"></i>
            ${post.likes_count || 0}
          </span>
        </div>
      </div>
    `;
    
    // Add click event to open post
    card.addEventListener('click', () => {
      window.open(link, '_blank');
    });
    
    return card;
  }

  getCategoryByTagId(tagId) {
    const categoryMap = {
      2: 'DevOps - System Admin',
      3: 'Kinh Nghiệm Lập Trình', 
      4: 'Linux Tip & Tricks',
      7: 'DevOps - System Admin',
      8: 'Tutorial',
      // Add more mappings as needed
    };
    return categoryMap[tagId] || 'General';
  }

  getCategoryColor(category) {
    const colors = {
      'DevOps - System Admin': '#10b981',
      'Linux Tip & Tricks': '#3b82f6', 
      'Kinh Nghiệm Lập Trình': '#ef4444',
      'Programming': '#8b5cf6',
      'Tutorial': '#f59e0b',
      'General': '#6b7280'
    };
    return colors[category] || colors['General'];
  }

  getTimeAgo(dateString) {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return '1 ngày trước';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInWeeks === 1) return '1 tuần trước';
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    if (diffInMonths === 1) return '1 tháng trước';
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    return `${Math.floor(diffInMonths / 12)} năm trước`;
  }
}