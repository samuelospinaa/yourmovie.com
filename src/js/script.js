const $ = (selector) => document.querySelector(selector);

const API_KEY = "0f1e85c7df926b373c71b2470adc50c7";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const DEFAULT_IMAGE = "./public/th.png";

const elements = {
  button: $("#search-button"),
  sectionView: $("#section-movie-view"),
  mainSection: $("#main-section"),
  article: $("article"),
  leftAnimation: $(".lateral-left"),
  rightAnimation: $(".lateral-right"),
};

const PLATFORM_IMAGES = {
  Netflix: "../public/netflix.svg",
  "Amazon Prime": "../public/amazon.svg",
  "Disney+": "../public/disney.svg",
  "HBO Max": "../public/hbologo.svg",
};

function getStreamingPlatforms(platforms) {
  if (!platforms || !platforms.length) return [];

  return platforms
    .filter((platform) => platform.streamingType === "subscription")
    .map((platform) => ({
      service: platform.service,
      image: PLATFORM_IMAGES[platform.service] || DEFAULT_IMAGE,
    }));
}

function createPlatformsList(platforms) {
  if (!platforms.length) return "<p>No subscription platforms available</p>";

  return `
    <h3>Available on:</h3>
    <ul>
      ${platforms
        .map(
          (platform) =>
            `<li><img src="${platform.image}" alt="${platform.service}"></li>`
        )
        .join("")}
    </ul>
  `;
}

function createView(movieData, streamingData) {
  const movie = movieData.results[0];
  const platforms = streamingData
    ? getStreamingPlatforms(streamingData[0]?.streamingInfo?.us)
    : [];

  const imageUrl = movie.poster_path
    ? `${BASE_IMAGE_URL}${movie.poster_path}`
    : DEFAULT_IMAGE;

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
        ${createPlatformsList(platforms)}
      </div>
      <div class="data">
        <p><strong>Rating: ${movie.vote_average}</strong></p>
        <p><strong>Release date: ${movie.release_date}</strong></p>
        <button id="other-search">Search another movie</button>
      </div>
    </div>
  `;

  elements.sectionView.innerHTML = htmlView;
  setupOtherSearchButton();
  hideMainElements();
}

function setupOtherSearchButton() {
  const buttonAnother = $("#other-search");
  if (buttonAnother) {
    buttonAnother.addEventListener("click", () => window.location.reload());
  }
}

function hideMainElements() {
  elements.mainSection.style.display = "none";
  elements.leftAnimation.style.display = "none";
  elements.rightAnimation.style.display = "none";
}

function validateSearch(search) {
  if (!search?.trim()) {
    throw new Error("Please enter a movie title");
  }
  return search.trim();
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
    throw new Error("Movie not found");
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

  const response = await fetch(
    `https://streaming-availability.p.rapidapi.com/search/title?title=${encodeURIComponent(
      search
    )}&country=us&show_type=movie&output_language=en`,
    options
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch platform data: ${response.statusText}`);
  }

  return response.json();
}

async function handleSearch() {
  try {
    const searchInput = $("#search");
    const search = validateSearch(searchInput.value);

    localStorage.setItem("movieTitle", search);

    const [movieData, platformData] = await Promise.all([
      fetchMovie(search),
      fetchPlatforms(search),
    ]);

    createView(movieData, platformData);
  } catch (error) {
    alert(error.message);
    console.error("Search error:", error);
  }
}

elements.button.addEventListener("click", handleSearch);
