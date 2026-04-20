// Navbar scroll effect
const siteHeader = document.getElementById('site-header');
const onScroll = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 80);
};
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
});

mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

document.addEventListener('click', event => {
    if (!siteHeader.contains(event.target) && !mobileNav.contains(event.target)) {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    }
});

// Smooth scroll with fixed-nav offset
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
        const id = link.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10);
        const top = target.getBoundingClientRect().top + window.scrollY - (id === '#home' ? 0 : offset);
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

// Door preview builder
const previewSection = document.getElementById('door-preview');
const previewTriggers = Array.from(document.querySelectorAll('.preview-trigger'));
const previewSummaries = {
    size: document.getElementById('preview-summary-size'),
    style: document.getElementById('preview-summary-style'),
    window: document.getElementById('preview-summary-window')
};
const previewSummaryFallbacks = {
    size: 'Choose one',
    style: 'Choose one',
    window: 'Choose one'
};
const previewSelections = {
    size: '',
    style: '',
    window: ''
};
const previewWindowFiles = [
    'L07-Arched-Stockton-470x66.png',
    'L08-Stockton-470x66.png',
    'L09-Cascade-470x66.png',
    'L10-Waterton-470x66.png',
    'L11-Straight-Stockbridge-470x66.png',
    'L12-Arched-Stockbridge-470x66.png',
    'L13-Clear-470x66.png',
    'L14-Sunburst-Long-470x66.png'
];
const windowStyleGrid = document.getElementById('window-style-grid');
const previewSendHelp = document.querySelector('.preview-send-help');
const previewSendSummary = document.getElementById('preview-send-summary');
const previewSendButton = document.getElementById('preview-send-button');

function formatWindowStyleLabel(filename) {
    return filename
        .replace(/\.[^.]+$/, '')
        .replace(/^L\d+-/, '')
        .replace(/-\d+x\d+$/i, '')
        .replace(/-/g, ' ');
}

function updatePreviewSummary(group) {
    previewSummaries[group].textContent = previewSelections[group] || previewSummaryFallbacks[group];
}

function getPreviewEmailHref() {
    const subject = 'Estimate request from website';
    const body = [
        'Hello JCM Garage Door,',
        '',
        'Here is my garage door design selection for a free estimate:',
        '',
        `Size: ${previewSelections.size || 'Not selected'}`,
        `Door style: ${previewSelections.style || 'Not selected'}`,
        `Window style: ${previewSelections.window || 'Not selected'}`
    ].join('\n');

    return `mailto:Jcmgaragedoor666@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function updatePreviewSendButton() {
    const isComplete = Object.values(previewSelections).every(Boolean);

    previewSendHelp.hidden = isComplete;
    previewSendSummary.hidden = !isComplete;
    previewSendSummary.textContent = isComplete
        ? `Your design: ${previewSelections.size} door(s) in ${previewSelections.style} style with ${previewSelections.window} style windows.`
        : '';

    previewSendButton.classList.toggle('is-disabled', !isComplete);
    previewSendButton.setAttribute('aria-disabled', String(!isComplete));
    previewSendButton.tabIndex = isComplete ? 0 : -1;
    previewSendButton.href = isComplete ? getPreviewEmailHref() : '#';
}

function renderWindowChoices() {
    windowStyleGrid.innerHTML = previewWindowFiles.map(filename => {
        const label = formatWindowStyleLabel(filename);
        const selectedClass = label === previewSelections.window ? ' is-selected' : '';
        return `
            <button class="preview-choice preview-choice-window${selectedClass}" type="button" data-preview-group="window" data-preview-value="${label}">
                <img class="preview-step3-image" src="images/windows/${filename}" alt="${label} window style preview" loading="lazy">
                <span class="preview-choice-label">${label}</span>
            </button>
        `;
    }).join('');
}

function setPreviewSelection(group, value) {
    previewSelections[group] = value;
    updatePreviewSummary(group);
    updatePreviewSendButton();

    if (group === 'window') {
        renderWindowChoices();
        return;
    }

    document.querySelectorAll(`[data-preview-group="${group}"]`).forEach(button => {
        button.classList.toggle('is-selected', button.dataset.previewValue === value);
    });
}

function togglePreviewStep(activeTrigger) {
    const isExpanding = activeTrigger.getAttribute('aria-expanded') !== 'true';

    previewTriggers.forEach(trigger => {
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        const shouldOpen = trigger === activeTrigger ? isExpanding : false;

        trigger.setAttribute('aria-expanded', String(shouldOpen));
        trigger.closest('.preview-step').classList.toggle('is-open', shouldOpen);
        panel.hidden = !shouldOpen;
    });
}

previewTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => togglePreviewStep(trigger));
});

previewSection.addEventListener('click', event => {
    const choice = event.target.closest('.preview-choice');
    if (!choice) return;

    setPreviewSelection(choice.dataset.previewGroup, choice.dataset.previewValue);
});

renderWindowChoices();
updatePreviewSummary('size');
updatePreviewSummary('style');
updatePreviewSummary('window');
updatePreviewSendButton();

// Paginated gallery
const galleryImages = Array.from({ length: 35 }, (_, index) => {
    const imageNumber = String(index + 1).padStart(4, '0');
    return {
        src: `images/gallery/IMG-20260328-WA${imageNumber}.jpg`,
        alt: `JCM Garage Door gallery image ${index + 1}`
    };
});

const galleryGrid = document.getElementById('photo-gallery-grid');
const galleryPrevButton = document.getElementById('gallery-prev');
const galleryNextButton = document.getElementById('gallery-next');
const galleryPageIndicator = document.getElementById('gallery-page-indicator');
const galleryLightbox = document.getElementById('gallery-lightbox');
const galleryLightboxImage = document.getElementById('gallery-lightbox-image');
const galleryLightboxClose = document.getElementById('gallery-lightbox-close');
const galleryItemsPerPage = 9;
const galleryTotalPages = Math.ceil(galleryImages.length / galleryItemsPerPage);
let galleryCurrentPage = 1;
let galleryLightboxResetTimer = null;

function openGalleryLightbox(src, alt) {
    if (galleryLightboxResetTimer) {
        clearTimeout(galleryLightboxResetTimer);
        galleryLightboxResetTimer = null;
    }

    galleryLightboxImage.src = src;
    galleryLightboxImage.alt = alt;
    galleryLightbox.classList.add('open');
    galleryLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeGalleryLightbox() {
    galleryLightbox.classList.remove('open');
    galleryLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    galleryLightboxResetTimer = setTimeout(() => {
        if (!galleryLightbox.classList.contains('open')) {
            galleryLightboxImage.src = '';
            galleryLightboxImage.alt = '';
        }
        galleryLightboxResetTimer = null;
    }, 250);
}

function renderGalleryPage(pageNumber) {
    const startIndex = (pageNumber - 1) * galleryItemsPerPage;
    const pageImages = galleryImages.slice(startIndex, startIndex + galleryItemsPerPage);

    galleryGrid.innerHTML = pageImages.map(image => `
        <figure class="photo-gallery-item">
            <img src="${image.src}" alt="${image.alt}" loading="lazy">
        </figure>
    `).join('');

    galleryPageIndicator.textContent = `Page ${pageNumber} / ${galleryTotalPages}`;
    galleryPrevButton.disabled = pageNumber === 1;
    galleryNextButton.disabled = pageNumber === galleryTotalPages;
}

galleryGrid.addEventListener('click', event => {
    const image = event.target.closest('.photo-gallery-item img');
    if (!image) return;
    openGalleryLightbox(image.src, image.alt);
});

galleryPrevButton.addEventListener('click', () => {
    if (galleryCurrentPage === 1) return;
    galleryCurrentPage -= 1;
    renderGalleryPage(galleryCurrentPage);
});

galleryNextButton.addEventListener('click', () => {
    if (galleryCurrentPage === galleryTotalPages) return;
    galleryCurrentPage += 1;
    renderGalleryPage(galleryCurrentPage);
});

galleryLightboxClose.addEventListener('click', closeGalleryLightbox);

galleryLightbox.addEventListener('click', event => {
    if (event.target === galleryLightbox) {
        closeGalleryLightbox();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && galleryLightbox.classList.contains('open')) {
        closeGalleryLightbox();
    }
});

renderGalleryPage(galleryCurrentPage);

// Fade-up on scroll
const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(element => fadeObserver.observe(element));