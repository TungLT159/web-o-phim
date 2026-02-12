const apiConfig = {
  baseUrl: "https://ophim1.com/",
  apiKey: "2724d844032ce6b2526dad06a0936a6e",
  originalImage: (imgPath) =>
    `https://img.ophim.live/uploads/movies/${imgPath}`,
  w500Image: (imgPath) => `https://image.tmdb.org/t/p/w500/${imgPath}`,
};

export default apiConfig;
