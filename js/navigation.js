// Navigation Manager
class NavigationManager {
    constructor(app) {
        this.app = app;
        this.sidebarOpen = false;
    }

    init() {
        this.setupSidebarNavigation();
        this.setupMobileToggle();
        this.setupResponsiveNav();
    }

    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.sidebar-menu a[data-page]');
        const footerLinks = document.querySelectorAll('.sidebar-footer a[data-page]');
        
        [...navLinks, ...footerLinks].forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const pageId = link.dataset.page;
                
                // Update active states
                this.updateActiveStates(link);
                
                // Navigate to page
                this.app.navigateToPage(pageId);
                
                // Close mobile sidebar
                if (window.innerWidth <= 768) {
                    this.closeMobileSidebar();
                }
            });
        });
    }

    setupMobileToggle() {
        const toggleBtn = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    this.sidebarOpen && 
                    !sidebar.contains(e.target) && 
                    !toggleBtn.contains(e.target)) {
                    this.closeMobileSidebar();
                }
            });
        }
    }

    setupResponsiveNav() {
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileSidebar();
            }
        });
    }

    updateActiveStates(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.sidebar-menu a, .sidebar-footer a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        
        if (this.sidebarOpen) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }

    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.add('open');
        this.sidebarOpen = true;
        
        // Add backdrop
        this.createBackdrop();
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
        this.sidebarOpen = false;
        
        // Remove backdrop
        this.removeBackdrop();
    }

    createBackdrop() {
        if (document.querySelector('.sidebar-backdrop')) return;
        
        const backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(backdrop);
        
        // Trigger opacity transition
        setTimeout(() => {
            backdrop.style.opacity = '1';
        }, 10);
        
        backdrop.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
    }

    removeBackdrop() {
        const backdrop = document.querySelector('.sidebar-backdrop');
        if (backdrop) {
            backdrop.style.opacity = '0';
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 300);
        }
    }

    // Navigate to specific page programmatically
    navigateTo(pageId) {
        // Find the nav link for this page
        const navLink = document.querySelector(`[data-page="${pageId}"]`);
        if (navLink) {
            this.updateActiveStates(navLink);
        }
        
        this.app.navigateToPage(pageId);
    }

    // Get current active page
    getCurrentPage() {
        return this.app.currentPage;
    }
}