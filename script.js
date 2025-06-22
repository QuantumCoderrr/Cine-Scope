// TMDB API Configuration
const API_KEY = "74ae098557d9f43f1de7c297d94dc49b"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

// Global variables
let currentUser = null
let genres = []
let currentPage = 1
let currentSection = "home"
let searchTimeout = null

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Check if user is logged in
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showPage("home")
    updateUserGreeting()
    loadGenres()
  } else {
    showPage("landing")
  }

  // Setup event listeners
  setupEventListeners()
}

function setupEventListeners() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const mobileMenu = document.getElementById("mobileMenu")

  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden")
    mobileMenuBtn.classList.toggle("hamburger-active")
  })

  // Search functionality
  const searchInput = document.getElementById("searchInput")
  const mobileSearchInput = document.getElementById("mobileSearchInput")

  searchInput.addEventListener("input", handleSearch)
  mobileSearchInput.addEventListener("input", handleMobileSearch)
  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#searchInput") && !e.target.closest("#searchResults")) {
      document.getElementById("searchResults").classList.add("hidden")
    }
    if (!e.target.closest("#mobileSearchInput") && !e.target.closest("#mobileSearchResults")) {
      document.getElementById("mobileSearchResults").classList.add("hidden")
    }
  })

  // Form submissions
  document.getElementById("loginForm").addEventListener("submit", handleLogin)
  document.getElementById("signupForm").addEventListener("submit", handleSignup)
  document.getElementById("passwordResetForm").addEventListener("submit", handlePasswordReset)

  // Modal close
  document.getElementById("movieModal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal()
    }
  })

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal()
    }
  })
}

// Page Navigation
function showPage(pageName) {
  // Hide all pages
  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => page.classList.add("hidden"))

  // Show selected page
  const targetPage = document.getElementById(pageName + "Page")
  if (targetPage) {
    targetPage.classList.remove("hidden")
    targetPage.classList.add("fade-in")
    currentSection = pageName

    // Load page-specific content
    switch (pageName) {
      case "home":
        loadHomePage()
        break
      case "trending":
        loadTrendingMovies()
        break
      case "discover":
        loadDiscoverPage()
        break
      case "watchlist":
        loadWatchlist()
        break
      case "ratings":
        loadRatings()
        break
    }

    // Update active nav link
    updateActiveNavLink(pageName)
  }

  // Hide mobile menu
  document.getElementById("mobileMenu").classList.add("hidden")
  document.getElementById("mobileMenuBtn").classList.remove("hamburger-active")
}

function updateActiveNavLink(pageName) {
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.classList.remove("text-yellow-400")
    link.classList.add("text-gray-300")
  })

  // Find and highlight active link
  navLinks.forEach((link) => {
    if (link.textContent.toLowerCase() === pageName) {
      link.classList.remove("text-gray-300")
      link.classList.add("text-yellow-400")
    }
  })
}

// Authentication Functions
function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  // Simple validation (in real app, this would be server-side)
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(user))
    showToast("Welcome back!", "success")
    showPage("home")
    updateUserGreeting()
    loadGenres()
  } else {
    showToast("Invalid email or password", "error")
  }
}

function handleSignup(e) {
  e.preventDefault()

  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("signupConfirmPassword").value

  if (password !== confirmPassword) {
    showToast("Passwords do not match", "error")
    return
  }

  // Check if user already exists
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  if (users.find((u) => u.email === email)) {
    showToast("User already exists", "error")
    return
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    watchlist: [],
    ratings: {},
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  currentUser = newUser
  localStorage.setItem("currentUser", JSON.stringify(newUser))

  showToast("Account created successfully!", "success")
  showPage("home")
  updateUserGreeting()
  loadGenres()
}

function handlePasswordReset(e) {
  e.preventDefault()

  const email = document.getElementById("resetEmail").value

  // Simulate password reset
  showToast("Password reset link sent to your email", "success")
  setTimeout(() => {
    showPage("login")
  }, 2000)
}

function logout() {
  currentUser = null
  localStorage.removeItem("currentUser")
  showToast("Logged out successfully", "success")
  showPage("landing")
}

function updateUserGreeting() {
  if (currentUser) {
    const greeting = `Hello, ${currentUser.name}`
    document.getElementById("userGreeting").textContent = greeting
    document.getElementById("mobileUserGreeting").textContent = greeting
  }
}

// API Functions
async function fetchFromAPI(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.append("api_key", API_KEY)

  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key])
    }
  })

  try {
    showLoading()
    const response = await fetch(url)
    const data = await response.json()
    hideLoading()
    return data
  } catch (error) {
    hideLoading()
    console.error("API Error:", error)
    showToast("Failed to load data", "error")
    return null
  }
}

async function loadGenres() {
  const data = await fetchFromAPI("/genre/movie/list")
  if (data && data.genres) {
    genres = data.genres
    populateGenreFilter()
  }
}

function populateGenreFilter() {
  const genreFilter = document.getElementById("genreFilter")
  genreFilter.innerHTML = '<option value="">All Genres</option>'

  genres.forEach((genre) => {
    const option = document.createElement("option")
    option.value = genre.id
    option.textContent = genre.name
    genreFilter.appendChild(option)
  })
}

// Search Functions
function handleSearch(e) {
  const query = e.target.value.trim()

  clearTimeout(searchTimeout)

  if (query.length < 2) {
    document.getElementById("searchResults").classList.add("hidden")
    return
  }

  searchTimeout = setTimeout(() => {
    searchMovies(query, "searchResults")
  }, 300)
}

function handleMobileSearch(e) {
  const query = e.target.value.trim()

  clearTimeout(searchTimeout)

  if (query.length < 2) {
    document.getElementById("mobileSearchResults").classList.add("hidden")
    return
  }

  searchTimeout = setTimeout(() => {
    searchMovies(query, "mobileSearchResults")
  }, 300)
}

async function searchMovies(query, containerId) {
  const data = await fetchFromAPI("/search/movie", { query })

  if (data && data.results) {
    displaySearchResults(data.results.slice(0, 5), containerId)
  }
}

function displaySearchResults(movies, containerId) {
  const container = document.getElementById(containerId)

  if (movies.length === 0) {
    container.innerHTML = '<div class="p-4 text-gray-400">No results found</div>'
    container.classList.remove("hidden")
    return
  }

  container.innerHTML = movies
    .map(
      (movie) => `
        <div class="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0" 
             onclick="openMovieModal(${movie.id})">
            <div class="flex items-center space-x-3">
                <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : "/placeholder.svg?height=60&width=40"}" 
                     alt="${movie.title}" class="w-10 h-15 object-cover rounded">
                <div>
                    <h4 class="font-semibold text-sm">${movie.title}</h4>
                    <p class="text-xs text-gray-400">${movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</p>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  container.classList.remove("hidden")
}

// Page Loading Functions
async function loadHomePage() {
  // Load popular movies
  const popularData = await fetchFromAPI("/movie/popular")
  if (popularData && popularData.results) {
    displayMovies(popularData.results.slice(0, 12), "popularMovies")
  }

  // Load top rated movies
  const topRatedData = await fetchFromAPI("/movie/top_rated")
  if (topRatedData && topRatedData.results) {
    displayMovies(topRatedData.results.slice(0, 12), "topRatedMovies")
  }
}

async function loadTrendingMovies(page = 1) {
  const data = await fetchFromAPI("/trending/movie/week", { page })
  if (data && data.results) {
    displayMovies(data.results, "trendingMovies")
    displayPagination(data, "trendingPagination", "loadTrendingMovies")
  }
}

async function loadDiscoverPage() {
  // Populate year filter
  populateYearFilter()

  // Load initial movies
  await discoverMovies()
}

function populateYearFilter() {
  const yearFilter = document.getElementById("yearFilter")
  yearFilter.innerHTML = '<option value="">All Years</option>'

  const currentYear = new Date().getFullYear()
  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement("option")
    option.value = year
    option.textContent = year
    yearFilter.appendChild(option)
  }
}

async function applyFilters() {
  currentPage = 1
  await discoverMovies()
}

async function discoverMovies(page = 1) {
  const genreId = document.getElementById("genreFilter").value
  const year = document.getElementById("yearFilter").value
  const sortBy = document.getElementById("sortFilter").value

  const params = {
    page,
    sort_by: sortBy,
    with_genres: genreId,
    primary_release_year: year,
  }

  const data = await fetchFromAPI("/discover/movie", params)
  if (data && data.results) {
    displayMovies(data.results, "discoverMovies")
    displayPagination(data, "discoverPagination", "discoverMovies")
  }
}

function loadWatchlist() {
  if (!currentUser || !currentUser.watchlist || currentUser.watchlist.length === 0) {
    document.getElementById("watchlistMovies").innerHTML = ""
    document.getElementById("emptyWatchlist").classList.remove("hidden")
    return
  }

  document.getElementById("emptyWatchlist").classList.add("hidden")
  displayMovies(currentUser.watchlist, "watchlistMovies")
}

function loadRatings() {
  if (!currentUser || !currentUser.ratings || Object.keys(currentUser.ratings).length === 0) {
    document.getElementById("ratedMovies").innerHTML = ""
    document.getElementById("emptyRatings").classList.remove("hidden")
    return
  }

  document.getElementById("emptyRatings").classList.add("hidden")

  const ratedMovies = Object.keys(currentUser.ratings).map((movieId) => {
    const movie = currentUser.ratings[movieId].movie
    const rating = currentUser.ratings[movieId].rating
    return { ...movie, userRating: rating }
  })

  displayRatedMovies(ratedMovies, "ratedMovies")
}

// Display Functions
function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId)

  container.innerHTML = movies
    .map(
      (movie) => `
        <div class="movie-card bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer" 
             onclick="openMovieModal(${movie.id})">
            <div class="relative">
                <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : "/placeholder.svg?height=300&width=200"}" 
                     alt="${movie.title}" class="w-full h-64 object-cover">
                <div class="absolute top-2 right-2 bg-black bg-opacity-75 text-yellow-400 px-2 py-1 rounded text-sm font-bold">
                    <i class="fas fa-star mr-1"></i>${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-sm mb-2 line-clamp-2">${movie.title}</h3>
                <p class="text-gray-400 text-xs">${movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

function displayRatedMovies(movies, containerId) {
  const container = document.getElementById(containerId)

  container.innerHTML = movies
    .map(
      (movie) => `
        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div class="flex">
                <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : "/placeholder.svg?height=200&width=133"}" 
                     alt="${movie.title}" class="w-32 h-48 object-cover cursor-pointer" onclick="openMovieModal(${movie.id})">
                <div class="p-4 flex-1">
                    <h3 class="font-semibold text-lg mb-2 cursor-pointer hover:text-yellow-400" onclick="openMovieModal(${movie.id})">${movie.title}</h3>
                    <p class="text-gray-400 text-sm mb-3">${movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</p>
                    <div class="mb-3">
                        <p class="text-sm text-gray-300 mb-2">Your Rating:</p>
                        <div class="star-rating">
                            ${generateStarRating(movie.userRating, movie.id, false)}
                        </div>
                    </div>
                    <p class="text-gray-300 text-sm line-clamp-3">${movie.overview || "No description available."}</p>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function displayPagination(data, containerId, loadFunction) {
  const container = document.getElementById(containerId)
  const totalPages = Math.min(data.total_pages, 500) // TMDB API limit
  const currentPage = data.page

  let paginationHTML = ""

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `
            <button onclick="${loadFunction}(${currentPage - 1})" 
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <i class="fas fa-chevron-left"></i>
            </button>
        `
  }

  // Page numbers
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, currentPage + 2)

  if (startPage > 1) {
    paginationHTML += `
            <button onclick="${loadFunction}(1)" 
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">1</button>
        `
    if (startPage > 2) {
      paginationHTML += '<span class="px-2 text-gray-400">...</span>'
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <button onclick="${loadFunction}(${i})" 
                    class="px-4 py-2 ${i === currentPage ? "bg-yellow-500 text-black" : "bg-gray-700 hover:bg-gray-600"} rounded-lg transition-colors">
                ${i}
            </button>
        `
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += '<span class="px-2 text-gray-400">...</span>'
    }
    paginationHTML += `
            <button onclick="${loadFunction}(${totalPages})" 
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">${totalPages}</button>
        `
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `
            <button onclick="${loadFunction}(${currentPage + 1})" 
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <i class="fas fa-chevron-right"></i>
            </button>
        `
  }

  container.innerHTML = paginationHTML
}

// Movie Modal Functions
async function openMovieModal(movieId) {
  const movieData = await fetchFromAPI(`/movie/${movieId}`)
  const creditsData = await fetchFromAPI(`/movie/${movieId}/credits`)

  if (movieData) {
    displayMovieModal(movieData, creditsData)
    document.getElementById("movieModal").classList.remove("hidden")
  }
}

function displayMovieModal(movie, credits) {
  const isInWatchlist = currentUser && currentUser.watchlist.some((m) => m.id === movie.id)
  const userRating =
    currentUser && currentUser.ratings && currentUser.ratings[movie.id] ? currentUser.ratings[movie.id].rating : 0

  const director = credits && credits.crew ? credits.crew.find((person) => person.job === "Director") : null
  const cast = credits && credits.cast ? credits.cast.slice(0, 10) : []

  const modalContent = `
        <div class="relative">
            <button onclick="closeModal()" class="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-colors">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="flex flex-col lg:flex-row">
                <div class="lg:w-1/3">
                    <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : "/placeholder.svg?height=600&width=400"}" 
                         alt="${movie.title}" class="w-full h-auto object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none">
                </div>
                
                <div class="lg:w-2/3 p-6">
                    <div class="mb-4">
                        <h2 class="text-3xl font-bold mb-2">${movie.title}</h2>
                        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                            <span><i class="fas fa-calendar mr-1"></i>${movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</span>
                            <span><i class="fas fa-clock mr-1"></i>${movie.runtime ? movie.runtime + " min" : "N/A"}</span>
                            <span><i class="fas fa-star mr-1 text-yellow-400"></i>${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
                        </div>
                    </div>

                    ${
                      movie.genres && movie.genres.length > 0
                        ? `
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold mb-2">Genres</h3>
                            <div class="flex flex-wrap gap-2">
                                ${movie.genres
                                  .map(
                                    (genre) => `
                                    <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">${genre.name}</span>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    ${
                      director
                        ? `
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold mb-2">Director</h3>
                            <p class="text-gray-300">${director.name}</p>
                        </div>
                    `
                        : ""
                    }

                    ${
                      cast.length > 0
                        ? `
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold mb-2">Cast</h3>
                            <div class="flex flex-wrap gap-2">
                                ${cast
                                  .map(
                                    (actor) => `
                                    <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">${actor.name}</span>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <div class="mb-4">
                        <h3 class="text-lg font-semibold mb-2">Overview</h3>
                        <p class="text-gray-300 leading-relaxed">${movie.overview || "No overview available."}</p>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-2">Your Rating</h3>
                        <div class="star-rating">
                            ${generateStarRating(userRating, movie.id, true)}
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="toggleWatchlist(${movie.id})" 
                                class="flex-1 ${isInWatchlist ? "bg-red-600 hover:bg-red-700" : "bg-yellow-500 hover:bg-yellow-600"} text-black font-semibold py-3 px-6 rounded-lg transition-colors">
                            <i class="fas ${isInWatchlist ? "fa-bookmark-slash" : "fa-bookmark"} mr-2"></i>
                            ${isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `

  document.getElementById("movieModalContent").innerHTML = modalContent
}

function generateStarRating(rating, movieId, interactive) {
  let starsHTML = ""
  for (let i = 1; i <= 5; i++) {
    const isActive = i <= rating
    const clickHandler = interactive ? `onclick="rateMovie(${movieId}, ${i})"` : ""
    starsHTML += `
            <i class="fas fa-star star ${isActive ? "active" : ""}" ${clickHandler}></i>
        `
  }
  return starsHTML
}

function closeModal() {
  document.getElementById("movieModal").classList.add("hidden")
}

// Watchlist and Rating Functions
async function toggleWatchlist(movieId) {
  if (!currentUser) return

  const movieData = await fetchFromAPI(`/movie/${movieId}`)
  if (!movieData) return

  const watchlistIndex = currentUser.watchlist.findIndex((m) => m.id === movieId)

  if (watchlistIndex > -1) {
    // Remove from watchlist
    currentUser.watchlist.splice(watchlistIndex, 1)
    showToast("Removed from watchlist", "success")
  } else {
    // Add to watchlist
    currentUser.watchlist.push(movieData)
    showToast("Added to watchlist", "success")
  }

  // Update localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser))
  updateUserInStorage()

  // Refresh modal and current page
  displayMovieModal(movieData, null)
  if (currentSection === "watchlist") {
    loadWatchlist()
  }
}

async function rateMovie(movieId, rating) {
  if (!currentUser) return

  const movieData = await fetchFromAPI(`/movie/${movieId}`)
  if (!movieData) return

  if (!currentUser.ratings) {
    currentUser.ratings = {}
  }

  currentUser.ratings[movieId] = {
    rating: rating,
    movie: movieData,
    timestamp: Date.now(),
  }

  // Update localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser))
  updateUserInStorage()

  showToast(`Rated ${rating} star${rating !== 1 ? "s" : ""}`, "success")

  // Refresh modal and ratings page if active
  displayMovieModal(movieData, null)
  if (currentSection === "ratings") {
    loadRatings()
  }
}

function updateUserInStorage() {
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex > -1) {
    users[userIndex] = currentUser
    localStorage.setItem("users", JSON.stringify(users))
  }
}

// Utility Functions
function showLoading() {
  document.getElementById("loadingSpinner").classList.remove("hidden")
}

function hideLoading() {
  document.getElementById("loadingSpinner").classList.add("hidden")
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer")
  const toast = document.createElement("div")

  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"
  const icon = type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"

  toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform translate-x-full transition-transform duration-300`
  toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `

  toastContainer.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.classList.remove("translate-x-full")
  }, 100)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add("translate-x-full")
    setTimeout(() => {
      toastContainer.removeChild(toast)
    }, 300)
  }, 3000)
}

// Add CSS for line clamping
const style = document.createElement("style")
style.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`
document.head.appendChild(style)
