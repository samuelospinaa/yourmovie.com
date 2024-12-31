const $ = (selector) => document.querySelector(selector);

const API_KEY = "0f1e85c7df926b373c71b2470adc50c7";
const button = $("#search-button");
const sectionView = $("#section-movie-view");
const mainSection = $("#main-section");
const article = $("article");
const inputContainer = $("#main-input-container");
const mainInput = $("#search");
const backgroundView = $(".dynamic-background");
//animations
const leftAnimation = $(".lateral-left");
const rightAnimation = $(".lateral-right");
const leftSecondAnimation = $(".lateral-left-left");
const rightSecondAnimation = $(".lateral-right-right");
//overlays
const overlayRight = $(".gradient-overlay-right");
const overlayLeft = $(".gradient-overlay-left");

function createView(movieData, platformData) {
  const movie = movieData.results[0];
  const baseUrl = "https://image.tmdb.org/t/p/w500";
  const notImageRoute = "../../public/th.png";
  const imageUrl = movie.poster_path
    ? `${baseUrl}${movie.poster_path}`
    : notImageRoute;

  // Get subscription platforms
  let availablePlatforms = [];
  if (platformData?.result?.[0]?.streamingInfo?.us) {
    availablePlatforms = platformData.result[0].streamingInfo.us
      .filter((item) => item.streamingType === "subscription")
      .map((item) => item.service);
  }

  availablePlatforms = [...new Set(availablePlatforms)];

  // Platform image mapping
  const getLogoPath = (platform) => {
    switch (platform.toLowerCase()) {
      case "netflix":
        return "../../public/netflix.svg";
      case "prime":
        return "../../public/amazon.svg";
      case "disney":
        return "../../public/disney.svg";
      case "hbo":
        return "../../public/hbologo.svg";
      case "hulu":
        return "../../public/hulu.svg";
      case "apple":
        return "../../public/appletv.svg";
      default:
        return platform.service;
    }
  };

  // Create platforms HTML
  const platformsHTML = availablePlatforms.length
    ? availablePlatforms
        .map(
          (platform) => `
          <li>
            <img src="${getLogoPath(
              platform
            )}" alt="${platform}" style="width: 50px; height: 50px;">
          </li>
        `
        )
        .join("")
    : "<p>No subscription platforms available</p>";

  const htmlView = `
    <div id="movie-view">
      <img 
        src="${imageUrl}" 
        alt="${movie.title}" 
        class="image" 
        style="max-width: 400px; border-radius: 10px; margin-top: 25px;"
      >
      <h2 class="title">${movie.title}</h2>
      <p class="overview">${movie.overview}</p>
      <div class="platforms">
        <h3>Available on:</h3>
        <ul style="list-style: none; padding: 0;">
          ${platformsHTML}
        </ul>
        <p><strong>Rating: ${movie.vote_average}</strong></p>
        <p><strong>Release date: ${movie.release_date}</strong></p>
        <button id="other-search">Search another movie</button>
      </div>
      <div class="other-movies">
      <h3>Other movies you might like:</h3>
      <div class="other-movies-container">
        <img src="https://image.tmdb.org/t/p/w500${movieData.results[1].poster_path}" alt="${movieData.results[1].title}" class="other-movie">
        <img src="https://image.tmdb.org/t/p/w500${movieData.results[2].poster_path}" alt="${movieData.results[2].title}" class="other-movie">
        <img src="https://image.tmdb.org/t/p/w500${movieData.results[3].poster_path}" alt="${movieData.results[3].title}" class="other-movie">
      </div>
    </div>
  `;

  sectionView.innerHTML = htmlView;
  const buttonAnother = $("#other-search");
  if (buttonAnother) {
    buttonAnother.addEventListener("click", () => {
      window.location.reload();
    });
  }

  //handle if the user click in another movie
  //movies that maybe the user likes, we need to recover each movie in this class
  const otherMovies = document.querySelectorAll(".other-movie");
  if (otherMovies) {
    otherMovies.forEach((movie) => {
      movie.addEventListener("click", async (e) => {
        try {
          const [movieData, platformData] = await Promise.all([
            fetchMovie(e.target.alt),
            fetchPlatforms(e.target.alt),
          ]);

          createOtherView(movieData, platformData);
        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      });
    });
  }

  //hide elements and animations for movie view
  [
    mainSection,
    leftAnimation,
    rightAnimation,
    leftSecondAnimation,
    rightSecondAnimation,
    overlayRight,
    overlayLeft,
  ].forEach((element) => {
    element.style.display = "none";
  });

  backgroundView.style.display = "block";
}

async function fetchMovie(search) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZjFlODVjN2RmOTI2YjM3M2M3MWIyNDcwYWRjNTBjNyIsIm5iZiI6MTczMzg4MTExMi44OTMsInN1YiI6IjY3NThlZDE4MjZiOWI4YWRhZmZlZTc3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GDNFsS8GUEAXXXFbCr_rNHQFUmpXQkUVqv2DNHe6wow",
    },
  };

  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      search
    )}&api_key=${API_KEY}`,
    options
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch movie data: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.results?.length) {
    //create error message
    let errorText = document.createElement("p");
    errorText.className = "error-text";

    errorText.innerHTML = "Movie not found";
    inputContainer.appendChild(errorText);
    mainInput.style.borderColor = "red";

    //the message will be removed after 3 seconds
    setTimeout(() => {
      errorText.remove();
      mainInput.style.borderColor = "black";
    }, 3000);
    return;
  }

  return data;
}

async function fetchPlatforms(search) {
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "139c5deaa1msh9968c6bf54ddb59p1c1999jsn5da2620328ea",
      "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(
      `https://streaming-availability.p.rapidapi.com/search/title?title=${encodeURIComponent(
        search
      )}&country=us&show_type=movie&output_language=en`,
      options
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch platform data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return null;
  }
}

async function saveSearch() {
  try {
    const search = $("#search").value;

    //if the user introduces an empty string or dont introduce anything
    if (!search) {
      //create error message
      let errorText = document.createElement("p");
      errorText.className = "error-text";

      errorText.innerHTML = "Please enter a movie title";
      inputContainer.appendChild(errorText);
      mainInput.style.borderColor = "red";

      //the message will be removed after 3 seconds
      setTimeout(() => {
        errorText.remove();
        mainInput.style.borderColor = "black";
      }, 3000);
      return;
    }

    const movieData = await fetchMovie(search);
    const platformData = await fetchPlatforms(search);

    createView(movieData, platformData);
  } catch (error) {
    alert(error.message);
    console.error("Search error:", error);
  }
}

function createOtherView(movieData, platformData) {
  const notImageRoute = "../../public/th.png";
  const movie = movieData.results[0];
  const baseUrl = "https://image.tmdb.org/t/p/w500";
  const imageUrl = movie.poster_path
    ? `${baseUrl}${movie.poster_path}`
    : notImageRoute;

  // Get subscription platforms
  let availablePlatforms = [];
  if (platformData?.result?.[0]?.streamingInfo?.us) {
    availablePlatforms = platformData.result[0].streamingInfo.us
      .filter((item) => item.streamingType === "subscription")
      .map((item) => item.service);
  }

  availablePlatforms = [...new Set(availablePlatforms)];

  // Platform image mapping
  const getLogoPath = (platform) => {
    switch (platform.toLowerCase()) {
      case "netflix":
        return "../../public/netflix.svg";
      case "prime":
        return "../../public/amazon.svg";
      case "disney":
        return "../../public/disney.svg";
      case "hbo":
        return "../../public/hbologo.svg";
      case "hulu":
        return "../../public/hulu.svg";
      case "apple":
        return "../../public/appletv.svg";
      default:
        return notImageRoute;
    }
  };

  // Create platforms HTML
  const platformsHTML = availablePlatforms.length
    ? availablePlatforms
        .map(
          (platform) => `
            <li>
              <img src="${getLogoPath(
                platform
              )}" alt="${platform}" style="width: 50px; height: 50px;">
            </li>
          `
        )
        .join("")
    : "<p>No subscription platforms available</p>";

  const htmlCode = `<div id="movie-view">
      <img 
        src="${imageUrl}" 
        alt="${movie.title}" 
        class="image" 
        style="max-width: 400px; border-radius: 10px; margin-top: 25px;"
      >
      <h2 class="title">${movie.title}</h2>
      <p class="overview">${movie.overview}</p>
      <div class="platforms">
        <h3>Available on:</h3>
        <ul style="list-style: none; padding: 0;">
          ${platformsHTML}
        </ul>
        <p><strong>Rating: ${movie.vote_average}</strong></p>
        <p><strong>Release date: ${movie.release_date}</strong></p>
        <button id="other-search">Search another movie</button>
      </div>`;

  sectionView.innerHTML = htmlCode;

  const buttonAnother = $("#other-search");
  if (buttonAnother) {
    buttonAnother.addEventListener("click", () => {
      window.location.reload();
    });
  }
}

button.addEventListener("click", saveSearch);
