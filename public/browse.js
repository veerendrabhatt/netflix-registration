/**
 * browse.js - Movie fetching and display logic using OMDB API
 */

const OMDB_API_KEY = '51a9739a';
const API_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

/**
 * Fetch movies by search term
 */
async function fetchMovies(searchTerm, type = 'movie') {
    try {
        const response = await fetch(`${API_URL}&s=${encodeURIComponent(searchTerm)}&type=${type}`);
        const data = await response.json();
        return data.Response === 'True' ? data.Search : [];
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

/**
 * Create a movie card element
 */
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';

    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">${movie.Year}</p>
        </div>
    `;

    return card;
}

/**
 * Display movies in a container
 */
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (movies.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        container.appendChild(createMovieCard(movie));
    });
}

/**
 * Initialize page content
 */
async function initBrowse() {
    // Load some default content
    const trending = await fetchMovies('Marvel');
    displayMovies(trending, 'trending-movies');

    const action = await fetchMovies('Action');
    displayMovies(action, 'action-movies');

    // Handle Search
    const searchInput = document.getElementById('movie-search');
    const searchBtn = document.getElementById('search-btn');
    const resultsSection = document.getElementById('search-results-section');

    const performSearch = async () => {
        const term = searchInput.value.trim();
        if (term.length < 2) return;

        resultsSection.style.display = 'block';
        const results = await fetchMovies(term);
        displayMovies(results, 'search-results');

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

document.addEventListener('DOMContentLoaded', initBrowse);
