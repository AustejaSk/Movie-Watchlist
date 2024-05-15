import { getDatabase, ref, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"
import { apiKey, app, makeApiRequest, moviesContainer, startStateEl, createMovieHtml } from './index.js'

const database = getDatabase(app)
const watchListInDB = ref(database, "watchList")


// This code listens for real-time updates to the watchlist in the database, retrieves the updated list of movies, fetches details for each movie, and renders them in the watchlist container. // 

onValue(watchListInDB, snapshot => {
    const moviesData = snapshot.val()
    
    if (moviesData && typeof moviesData === 'object') {
        const moviesArr = Object.values(moviesData)

        if (moviesArr.length > 0) {
            moviesContainer.innerHTML = ``
            for (let movie of moviesArr) {
                const currentMovie = movie
                fetchAndRenderWatchlistMovie(currentMovie)
            }
        }
    }
})


// This function is fetching the movie details from the API and then rendering the movie as part of the watchlist //

function fetchAndRenderWatchlistMovie(movie) {
    const movieDetails = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie}`
    makeApiRequest(movieDetails)
        .then(item => {
            if (item) {
                renderWatchlistMovie(item)
            }
        })
}


// This function takes in the movies html and displays it on the page  //


function renderWatchlistMovie(item) {
    startStateEl.classList.add("hidden")
    const movieContainer = document.createElement("div")
    movieContainer.className = "movie-container"
    movieContainer.innerHTML = createMovieHtml(item, true)
    moviesContainer.appendChild(movieContainer)

    const hr = document.createElement("hr")
    hr.className = "hr"
    moviesContainer.appendChild(hr)
    
    const removeButton = movieContainer.querySelector(".remove-btn")
    removeButton.addEventListener("click", () => {
        removeFromWatchlist(item.imdbID)
    }) 
}

// This function removes selected movie from the watchlist and also clears the html //

function removeFromWatchlist(imdbID) {
    const exactLocationOfMovieInDB = ref(database, `watchList/${imdbID}`)
    remove(exactLocationOfMovieInDB)
    if (document.querySelector('.movie-container')){
        document.querySelector('.movie-container').remove()  
    }
    if (document.querySelector(".hr")) {
        document.querySelector(".hr").remove()   
    }
    if (moviesContainer.innerHTML === "") {
        startStateEl.classList.remove("hidden")
    }
}
