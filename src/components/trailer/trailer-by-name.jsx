import { useEffect, useState } from "react";

function TrailerByName({ movieName }) {
  const [trailerUrl, setTrailerUrl] = useState("");

  useEffect(() => {
    async function fetchTrailer() {
      try {
        // 1. Tìm phim theo tên
        const searchRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=2724d844032ce6b2526dad06a0936a6e&query=${encodeURIComponent(
            movieName
          )}&language=en-US`
        );
        const searchData = await searchRes.json();

        if (searchData.results.length === 0) return;

        // Lấy id của phim đầu tiên
        const movieId = searchData.results[0].id;

        // 2. Lấy video (trailer) của phim đó
        const videosRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=2724d844032ce6b2526dad06a0936a6e&language=en-US`
        );
        const videosData = await videosRes.json();

        const trailer = videosData.results.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        );

        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
        }
      } catch (error) {
        console.error("Lỗi khi lấy trailer:", error);
      }
    }

    fetchTrailer();
  }, [movieName]);

  return trailerUrl ? (
    <iframe
      width="560"
      height="315"
      src={trailerUrl.replace("watch?v=", "embed/")}
      title={`Trailer ${movieName}`}
      frameBorder="0"
      allowFullScreen
    />
  ) : (
    <p>Không tìm thấy trailer cho {movieName}</p>
  );
}

export default TrailerByName;
