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

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0] ? fileInput.files[0].name : 'Ningun archivo seleccionado';
});

function savedReviews() {
  try { return JSON.parse(localStorage.getItem('susi-reviews') || '[]'); } catch { return []; }
}

function renderReview(review) {
  const card = document.createElement('article');
  card.className = 'review-card';
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  card.innerHTML = `<div class="review-meta"><strong></strong><span class="stars">${stars}</span></div><p></p><small>Publicado ahora</small>`;
  card.querySelector('strong').textContent = review.name;
  card.querySelector('p').textContent = review.comment;
  if (review.image) {
    const image = document.createElement('img');
    image.src = review.image;
    image.alt = `Foto compartida por ${review.name}`;
    card.appendChild(image);
  }
  reviewList.prepend(card);
}

savedReviews().forEach(renderReview);

reviewForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(reviewForm);
  const review = { name: data.get('name').trim(), rating: Number(data.get('rating')), comment: data.get('comment').trim() };
  const imageFile = fileInput.files[0];
  const publish = (image) => {
    if (image) review.image = image;
    const reviews = [review, ...savedReviews()].slice(0, 8);
    localStorage.setItem('susi-reviews', JSON.stringify(reviews));
    renderReview(review);
    reviewForm.reset();
    fileName.textContent = 'Ningun archivo seleccionado';
    formMessage.textContent = 'Tu comentario se publico en este navegador. Gracias por compartir.';
  };
  if (imageFile) {
    const reader = new FileReader();
    reader.addEventListener('load', () => publish(reader.result));
    reader.readAsDataURL(imageFile);
  } else publish();
});
