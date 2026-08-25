const SUPABASE_URL = "https://qkkvaqbzuqxehrycfveu.supabase.co";
const SUPABASE_KEY = "sb_publishable_RNt0LhJ_Wc-meV3Hl7hekQ_aBsWM1t5";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const slides = [...document.querySelectorAll('.gallery-slide')];
const siteHeader = document.querySelector('.site-header');
const dotsContainer = document.querySelector('.gallery-dots');
const galleryLabel = document.querySelector('.gallery-label');
let currentSlide = 0;
let slideTimer;

window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('is-compact', window.scrollY > 80);
}, { passive: true });

slides.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.className = `dot${index === 0 ? ' active' : ''}`;
  dot.type = 'button';
  dot.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
  dot.addEventListener('click', () => showSlide(index));
  dotsContainer.appendChild(dot);
});

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === currentSlide));
  document.querySelectorAll('.dot').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentSlide));
  galleryLabel.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(currentSlide + 1), 3000);
}

document.querySelector('#prevSlide').addEventListener('click', () => showSlide(currentSlide - 1));
document.querySelector('#nextSlide').addEventListener('click', () => showSlide(currentSlide + 1));
showSlide(0);

const reviewForm = document.querySelector('#reviewForm');
const reviewList = document.querySelector('#reviewList');
const fileInput = document.querySelector('#reviewPhoto');
const fileName = document.querySelector('#fileName');
const formMessage = document.querySelector('#formMessage');
const lightbox = document.querySelector('#imageLightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCaption = document.querySelector('#lightboxCaption');
const reviewsHeading = document.querySelector('.reviews-heading');
let lightboxImages = [];
let lightboxIndex = 0;
let reviewsExpanded = false;

fileInput.multiple = true;
document.querySelector('.file-label').childNodes[1].textContent = ' Adjuntar hasta 4 fotos ';

fileInput.addEventListener('change', () => {
    const selectedFiles = [...fileInput.files].slice(0, 4);
    fileName.textContent = selectedFiles.length
        ? `${selectedFiles.length} foto${selectedFiles.length === 1 ? '' : 's'} seleccionada${selectedFiles.length === 1 ? '' : 's'}`
        : 'Ningun archivo seleccionado';
});

function getReviewImages(review) {
    if (!review.image_url) return [];
    if (Array.isArray(review.image_url)) return review.image_url;
    try {
        const images = JSON.parse(review.image_url);
        return Array.isArray(images) ? images : [review.image_url];
    } catch {
        return [review.image_url];
    }
}

function updateLightbox() {
    lightboxImage.src = lightboxImages[lightboxIndex];
    lightboxImage.alt = `Imagen ${lightboxIndex + 1} de ${lightboxImages.length}`;
    lightboxCaption.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    document.querySelector('#lightboxPrev').hidden = lightboxImages.length < 2;
    document.querySelector('#lightboxNext').hidden = lightboxImages.length < 2;
}

function openLightbox(images, index = 0) {
    lightboxImages = images;
    lightboxIndex = index;
    updateLightbox();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
}

function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
}

document.querySelector('#lightboxClose').addEventListener('click', closeLightbox);
document.querySelector('#lightboxPrev').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
});
document.querySelector('#lightboxNext').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightbox();
});
lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') document.querySelector('#lightboxPrev').click();
    if (event.key === 'ArrowRight') document.querySelector('#lightboxNext').click();
});

function updateReviewVisibility() {
    const reviewCards = [...reviewList.querySelectorAll('.review-card')];
    const visibleReviewCount = 3;
    const hiddenReviewCards = reviewCards.slice(visibleReviewCount);

    hiddenReviewCards.forEach((card) => {
        card.classList.toggle('review-card-hidden', !reviewsExpanded);
    });

    let moreButton = reviewList.querySelector('.reviews-more-button');
    if (!hiddenReviewCards.length) {
        reviewsExpanded = false;
        moreButton?.remove();
        return;
    }

    if (!moreButton) {
        moreButton = document.createElement('button');
        moreButton.className = 'reviews-more-button';
        moreButton.type = 'button';
        moreButton.addEventListener('click', () => {
            reviewsExpanded = !reviewsExpanded;
            updateReviewVisibility();
        });
        reviewList.appendChild(moreButton);
    }
    moreButton.textContent = reviewsExpanded
        ? 'Ver menos comentarios'
        : 'Ver más comentarios';
}

function updateRatingSummary() {
    const ratings = [...reviewList.querySelectorAll('.review-card .stars')]
        .map((stars) => (stars.textContent.match(/★/g) || []).length)
        .filter((rating) => rating >= 1 && rating <= 5);
    const totalRatings = ratings.length;
    const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: ratings.filter((value) => value === rating).length
    }));
    const average = totalRatings
        ? (ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings).toFixed(1)
        : '0.0';

    let ratingSummary = reviewsHeading.querySelector('.rating-summary');
    if (!ratingSummary) {
        ratingSummary = document.createElement('aside');
        ratingSummary.className = 'rating-summary';
        reviewsHeading.appendChild(ratingSummary);
    }

    ratingSummary.innerHTML = `
        <div class="rating-overview">
            <strong>${average}</strong>
            <span class="rating-star" aria-hidden="true">★</span>
            <small>${totalRatings} comentario${totalRatings === 1 ? '' : 's'}</small>
        </div>
        <div class="rating-breakdown">
            ${ratingCounts.map(({ rating, count }) => {
                const percentage = totalRatings ? (count / totalRatings) * 100 : 0;
                return `<div class="rating-row"><span>${rating}</span><span class="rating-row-star">★</span><span class="rating-bar"><span style="width: ${percentage}%"></span></span><small>${Math.round(percentage)}%</small></div>`;
            }).join('')}
        </div>
    `;
}

function renderReview(review) {
    const card = document.createElement('article');
    card.className = 'review-card';

    const stars =
        '★'.repeat(review.rating) +
        '☆'.repeat(5 - review.rating);

    card.innerHTML = `
        <div class="review-meta">
            <strong></strong>
            <span class="stars">${stars}</span>
        </div>
        <p></p>
        <small>Publicado recientemente</small>
    `;

    card.querySelector('strong').textContent = review.name;
    card.querySelector('p').textContent = review.comment;

    const reviewImages = getReviewImages(review);
    if (reviewImages.length) {
        const imageGrid = document.createElement('div');
        imageGrid.className = 'review-images';
        reviewImages.slice(0, 4).forEach((imageUrl, imageIndex) => {
            const imageButton = document.createElement('button');
            imageButton.className = 'review-image-button';
            imageButton.type = 'button';
            imageButton.setAttribute('aria-label', `Abrir imagen ${imageIndex + 1} de ${review.name}`);
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = `Foto ${imageIndex + 1} compartida por ${review.name}`;
            imageButton.appendChild(image);
            imageButton.addEventListener('click', () => openLightbox(reviewImages, imageIndex));
            imageGrid.appendChild(imageButton);
        });
        card.appendChild(imageGrid);
    }

    reviewList.prepend(card);
    updateReviewVisibility();
    updateRatingSummary();
}

async function loadReviews() {
    const { data, error } = await supabaseClient
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar comentarios:', error);
        return;
    }

    // Conservamos los dos comentarios de ejemplo del HTML
    // y añadimos los comentarios reales de Supabase.
    data.forEach(renderReview);
    updateReviewVisibility();
    updateRatingSummary();
}

reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    formMessage.textContent = 'Publicando comentario...';

    const data = new FormData(reviewForm);

    const name = data.get('name').trim();
    const rating = Number(data.get('rating'));
    const comment = data.get('comment').trim();
    const imageFiles = [...fileInput.files].slice(0, 4);
    const imageUrls = [];

    // 1. Subir hasta cuatro imagenes si existen
    for (const imageFile of imageFiles) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('comentarios')
            .upload(fileName, imageFile);

        if (uploadError) {
            console.error('Error al subir imagen:', uploadError);
            formMessage.textContent =
                'No se pudo subir la imagen. Intenta nuevamente.';
            return;
        }

        // 2. Obtener URL pública de la imagen
        const { data: publicUrlData } = supabaseClient.storage
            .from('comentarios')
            .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
    }

    // 3. Guardar comentario en la tabla
    const { data: newComment, error: insertError } = await supabaseClient
        .from('comments')
        .insert({
            name: name,
            rating: rating,
            comment: comment,
            image_url: imageUrls.length ? JSON.stringify(imageUrls) : null
        })
        .select()
        .single();

    if (insertError) {
        console.error('Error al guardar comentario:', insertError);
        formMessage.textContent =
            'No se pudo publicar el comentario. Intenta nuevamente.';
        return;
    }

    // 4. Mostrar inmediatamente el comentario
    renderReview(newComment);

    // 5. Limpiar formulario
    reviewForm.reset();
    fileName.textContent = 'Ningun archivo seleccionado';

    formMessage.textContent =
        '¡Tu comentario se publicó correctamente! Gracias por compartir.';
});

// Cargar comentarios existentes al abrir la página
updateRatingSummary();
loadReviews();