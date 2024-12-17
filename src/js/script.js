const $ = (selector) => document.querySelector(selector);

const apiKEY = "0f1e85c7df926b373c71b2470adc50c7";

const button = $("#search-button");
const sectionView = $("#section-movie-view");
const mainSection = $("#main-section");
const article = $("article");
const leftAnimation = $(".lateral-left");
const rightAnimation = $(".lateral-right");

function createView(data) {
  const movie = data.results[0];
  const baseUrl = "https://image.tmdb.org/t/p/w500";
  const notImageRoute = "./public/th.png";
  const imageUrl = movie.poster_path
    ? `${baseUrl}${movie.poster_path}`
    : notImageRoute;

  const htmlView = `
        <img src="${imageUrl} alt="${movie.title}" class="image" style="max-width: 400px; border-radius: 10px; margin-top: 25px;">
        <h2 class="title">${movie.title}</h2>
        <p class="overview">${movie.overview}</p>
        <div class="data">
        <p><strong>Rating: ${movie.vote_average}</strong><</p>
        <p><strong>Release date: ${movie.release_date}</strong></p>
        <button id="other-search">No es lo que buscaba</button>
        </div>`;

  const divView = document.createElement("div");
  divView.id = "movie-view";

  divView.innerHTML = htmlView;

  sectionView.appendChild(divView);

  // button that let the user search for another movie
  const buttonAnother = $("#other-search");

  if (buttonAnother) {
    // if the user are searching for another thing we send him to the main section
    buttonAnother.addEventListener("click", () => {
      window.location.reload();
    });
  }
  mainSection.style.display = "none";
  leftAnimation.style.display = "none";
  rightAnimation.style.display = "none";
}

function saveSearch() {
  //const to recover the value of the search input
  const search = $("#search").value;
  //sending the search to the localstorage
  localStorage.setItem("movieTitle", search);

  //validation for the input search
  if (!search) {
    alert("Please enter a movie title");
    return;
  }
  // for every time that the user click on the button the fetchmvoie function will be called
  fetchMovie(search);
}

async function fetchMovie(search) {
  //object options for the fetch
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZjFlODVjN2RmOTI2YjM3M2M3MWIyNDcwYWRjNTBjNyIsIm5iZiI6MTczMzg4MTExMi44OTMsInN1YiI6IjY3NThlZDE4MjZiOWI4YWRhZmZlZTc3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GDNFsS8GUEAXXXFbCr_rNHQFUmpXQkUVqv2DNHe6wow",
    },
  };

  // main url to fetch the movie data
  const url = `https://api.themoviedb.org/3/search/movie?query=${search}&api_key=${apiKEY}`;

  const response = await fetch(url, options);
  if (!response.ok) throw new Error("Failed to fetch movie data");

  //allowing the response in a const to be used
  const data = await response.json();

  //validation if the movie that the user is searching is not found
  if (!data.results || data.results.length === 0) {
    alert("Movie not found");
  }
  // if the movie is found the createView function will be called
  if (data) {
    createView(data);
  }
}

//adding an event listener to the button for save the user search
button.addEventListener("click", saveSearch);
