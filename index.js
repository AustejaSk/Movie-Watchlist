export const apiKey = "1218d3ff"

const movieInput = document.getElementById("movie-search")
const searchBtn = document.getElementById("search-btn")
export const startStateEl = document.querySelector(".start-state")
export const moviesContainer = document.getElementById("movies-container")


// Importing the Realtime Database and creating a watchlist folder that will save movies // 

import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, onValue, set } from "firebase/database"

const appSettings = {
  databaseURL: "https://movie-watchlist-ca6c1-default-rtdb.europe-west1.firebasedatabase.app/",
}

export const app = initializeApp(appSettings)

const database = getDatabase(app)

const watchListInDB = ref(database, "watchList")


// Reusable function to make API requests
export async function makeApiRequest(url) {
    try {
        const response = await fetch(url)
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error making API request:', error)
        return null
    }
}


// Search function that fires both when search button is clicked and on keypress Enter, this function is rendering the movies that were found by the search //

if (movieInput) {
    movieInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            handleSearch()
        }
    })
}

if (searchBtn) {
    searchBtn.addEventListener("click", () => handleSearch())
}

function handleSearch() {
    const searchUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${movieInput.value}`
    makeApiRequest(searchUrl)
        .then(data => {
            movieInput.value = ""            
            startStateEl.classList.add("hidden")          
            data.Search === undefined ? handleSearchError() : fetchAndRenderMovies(data)
            moviesContainer.innerHTML = ``
    })   
}  

// This function adds the selected movies into watchlist folder in database //

async function addToWatchlist(imdbID) {
    if (!imdbID) return

    try {
        // Use the imdbID as the key in the watchlist
        const newWatchListRef = ref(database, `watchList/${imdbID}`)
        await set(newWatchListRef, imdbID)
        showMessage("The movie was added to the watchlist!")
    } catch (error) {
        showMessage("Error adding the movie to the watchlist")
    }
}

function showMessage(message) {
    const messageDiv = document.getElementById("message-div")
    messageDiv.textContent = message
    messageDiv.style.display = "block"
    setTimeout(() => {
        messageDiv.style.display = "none"
    }, 1500)
}


// This function adds an error message if search is unsuccessful //

function handleSearchError() {
        startStateEl.classList.remove("hidden")
        let imgElement = startStateEl.querySelector("img")
        if (imgElement) {
            imgElement.remove()
        }
        let h2Element = startStateEl.querySelector("h2")
        if (h2Element) {
            h2Element.innerText = "Unable to find what you’re looking for. Please try another search."
        }
}

// This function loops through all movies that were found by the search and renders all movies on the page //


function fetchAndRenderMovies(data) {
    data.Search.forEach(movie => {
        const movieDetails = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`
        makeApiRequest(movieDetails)
            .then(item => {
                renderSearchResultMovie(item)
            })
    })
}

// This function takes in the movies html and displays it on the page  //

function renderSearchResultMovie(item) {
    const movieContainer = document.createElement("div")
    movieContainer.className = "movie-container"
    movieContainer.innerHTML = createMovieHtml(item, false)
    moviesContainer.appendChild(movieContainer)
    
    const hr = document.createElement("hr")
    hr.className = "hr"
    moviesContainer.appendChild(hr)
    
    const watchlistButton = movieContainer.querySelector(".watchlist-btn")
    watchlistButton.addEventListener("click", () => {
        addToWatchlist(item.imdbID)
    })    
}


// This function creates a html for a movie and checks if the movie is located on search page or on the watchlist and adds the correct button // 

export function createMovieHtml(item, isInWatchlist) {
    const shortPlot = item.Plot.substring(0, 130) + "..."
    const fullPlot = item.Plot

    const plotHtml = item.Plot.length < 130 ?
        `<p class="movie-plot">${fullPlot}</p>` :
        `<p class="movie-plot">${shortPlot}<span class="toggle-plot-btn"> Read more</span></p>`

    const buttonHtml = isInWatchlist ?
        `<button class="watchlist-btn remove-btn" id="${item.imdbID}"><i class="fa-solid fa-circle-minus"></i>Remove</button>` :
        `<button class="watchlist-btn" id="${item.imdbID}"><i class="fa-solid fa-circle-plus"></i>Watchlist</button>`

    return `
        <img class="movie-poster" src="${item.Poster}">
        <div class="movie-info-container">
            <h3>${item.Title}</h3>
            <p class="imdb-rating">⭐ ${item.imdbRating}</p><br>
            <h4 class="movie-length">${item.Runtime}</h4>
            <h4 class="movie-genre">${item.Genre}</h4>
            ${buttonHtml}
            <div id="plot-container-${item.imdbID}">
                ${plotHtml}
            </div>
        </div>
    `
}