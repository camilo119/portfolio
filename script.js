// script.js
// Menu toggle, smooth scrolling, project filtering, lightbox, and contact form validation.

document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const primaryNav = document.getElementById('primary-nav');
    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!expanded));
            primaryNav.classList.toggle('open');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && primaryNav.classList.contains('open')) {
                primaryNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        });
    }

    // Smooth scrolling for same-page links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href === '#' || href === '#0') return;
            const targetId = href.slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, '', `#${targetId}`);
            }
        });
    });

    // Project filtering
    const filtersContainer = document.querySelector('.projects-filters');
    const projects = Array.from(document.querySelectorAll('.projects-grid .project'));
    if (filtersContainer && projects.length) {
        filtersContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            const filter = btn.getAttribute('data-filter');

            filtersContainer.querySelectorAll('button[data-filter]').forEach(b => {
                b.setAttribute('aria-pressed', String(b === btn));
            });

            filterProjects(filter);
        });
    }

    window.filterProjects = function filterProjects(category) {
        projects.forEach(p => {
            const cat = p.dataset.category || '';
            if (!category || category === 'all' || cat === category) {
                p.hidden = false;
                p.setAttribute('aria-hidden', 'false');
            } else {
                p.hidden = true;
                p.setAttribute('aria-hidden', 'true');
            }
        });
    };

    // Lightbox
    function createLightbox(contentEl, captionText) {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.tabIndex = -1;

        const dialog = document.createElement('div');
        dialog.className = 'lightbox-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'lightbox-content';

        const cloned = contentEl.cloneNode(true);
        cloned.classList.add('lightbox-media');

        const caption = document.createElement('div');
        caption.className = 'lightbox-caption';
        caption.textContent = captionText || '';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.type = 'button';
        closeBtn.textContent = 'Close';

        contentWrapper.appendChild(cloned);
        contentWrapper.appendChild(caption);
        contentWrapper.appendChild(closeBtn);
        dialog.appendChild(contentWrapper);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // focus management
        const previousActive = document.activeElement;
        closeBtn.focus();

        function cleanup() {
            document.body.removeChild(overlay);
            if (previousActive) previousActive.focus();
            document.removeEventListener('keydown', onKeyDown);
        }

        closeBtn.addEventListener('click', cleanup);
        overlay.addEventListener('click', (ev) => {
            if (ev.target === overlay) cleanup();
        });

        function onKeyDown(ev) {
            if (ev.key === 'Escape') cleanup();
        }
        document.addEventListener('keydown', onKeyDown);
    }

    document.querySelectorAll('.projects-grid .project figure').forEach(fig => {
        fig.style.cursor = 'zoom-in';
        fig.addEventListener('click', () => {
            const media = fig.querySelector('svg, img');
            const caption = fig.querySelector('figcaption')?.textContent || '';
            if (media) createLightbox(media, caption);
        });

        fig.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fig.click();
            }
        });
    });

    // Contact form validation + feedback
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (form) {
        function setFieldError(field, message) {
            field.setAttribute('aria-invalid', message ? 'true' : 'false');
            const id = field.id + '-error';
            let el = document.getElementById(id);
            if (!el && message) {
                el = document.createElement('div');
                el.id = id;
                el.className = 'field-error';
                el.setAttribute('role', 'alert');
                field.insertAdjacentElement('afterend', el);
            }
            if (el) {
                el.textContent = message || '';
                if (!message) el.remove();
            }
        }

        function validateField(field) {
            const name = field.name;
            const val = field.value.trim();
            if (name === 'name') {
                if (!val) { setFieldError(field, 'Please enter your name.'); return false; }
                setFieldError(field, ''); return true;
            }
            if (name === 'email') {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!val) { setFieldError(field, 'Please enter your email.'); return false; }
                if (!re.test(val)) { setFieldError(field, 'Please enter a valid email address.'); return false; }
                setFieldError(field, ''); return true;
            }
            if (name === 'message') {
                if (!val || val.length < 10) { setFieldError(field, 'Message must be at least 10 characters.'); return false; }
                setFieldError(field, ''); return true;
            }
            return true;
        }

        ['input','blur','change','keyup'].forEach(evt => {
            form.addEventListener(evt, (e) => {
                const t = e.target;
                if (t && ['name','email','message'].includes(t.name)) validateField(t);
            }, true);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fields = Array.from(form.elements).filter(el => el.name);
            let ok = true;
            fields.forEach(f => {
                if (['name','email','message'].includes(f.name)) {
                    ok = validateField(f) && ok;
                }
            });

            if (!ok) {
                status.textContent = 'Please correct the highlighted fields.';
                status.className = 'error';
                return;
            }

            status.textContent = 'Sending...';
            setTimeout(() => {
                status.textContent = 'Thank you — your message has been received.';
                status.className = 'success';
                form.reset();
            }, 700);
        });
    }

    // Set year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});