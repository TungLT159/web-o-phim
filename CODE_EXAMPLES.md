# WEB-O-PHIM: CODE EXAMPLES & QUICK START

## COMMON CODE PATTERNS

### 1. Loading Movie Details with Episodes

**File**: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx

`javascript
// Load movie details including episodes
useEffect(() => {
  const getDetail = async () => {
    try {
      const response = await tmdbApi.detail(category, id, { params: {} });
      const data = response.data.item;
      setItem(data);

      // Check if it's not a trailer
      if (
        data.episode_current !== "Trailer" &&
        data.episodes?.[0]?.server_data
      ) {
        // Set default episode (first or from URL param)
        let defaultEp = data.episodes[0].server_data[0];
        
        if (epFromUrl) {
          const found = data.episodes[0].server_data.find(
            (e) => e.name === epFromUrl
          );
          if (found) defaultEp = found;
        }
        
        setCurrentEp(defaultEp);

        // Check for saved watch progress
        const progress = getWatchProgress(id, defaultEp.name);
        if (
          progress &&
          shouldShowContinueWatching(progress.currentTime, progress.duration)
        ) {
          setSavedProgress(progress);
          setShowContinueWatching(true);
        }
      }
      
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error loading movie:', error);
    }
  };
  
  getDetail();
}, [category, id, epFromUrl]);
`

---

### 2. Accessing Episodes Data Structure

`javascript
// After tmdbApi.detail() response

// Get all episodes
const allEpisodes = item.episodes[0].server_data;
// Returns: [
//   { name: "1", slug: "tap-1", link_m3u8: "...", link_embed: "..." },
//   { name: "2", slug: "tap-2", link_m3u8: "...", link_embed: "..." }
// ]

// Get current episode index
const currentIndex = item.episodes[0].server_data.findIndex(
  (ep) => ep.name === currentEp.name
);
// Returns: 0, 1, 2, etc.

// Get total episodes
const totalEpisodes = item.episodes[0].server_data.length;

// Get specific episode
const episode2 = item.episodes[0].server_data[1];
// Returns: { name: "2", slug: "tap-2", link_m3u8: "...", link_embed: "..." }

// Get episode name
console.log(currentEp.name); // "1", "2", "3", etc.
console.log(currentEp.link_m3u8); // HLS URL
console.log(currentEp.link_embed); // Embed URL
`

---

### 3. Switching Episodes

**File**: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx

`javascript
const handleSelectEpisode = useCallback((ep) => {
  // 1. Update current episode state
  setCurrentEp(ep);

  // 2. Clear any pending auto-play timers
  clearAutoPlayTimers();

  // 3. Update URL parameter with episode
  const searchParams = new URLSearchParams(location.search);
  searchParams.set("ep", ep.name);
  navigate(
    {
      pathname: location.pathname,
      search: searchParams.toString(),
    },
    { replace: true }
  );

  // 4. Scroll video player into view
  if (videoRef.current) {
    videoRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  // 5. Check for saved progress on new episode
  const progress = getWatchProgress(id, ep.name);
  if (
    progress &&
    shouldShowContinueWatching(progress.currentTime, progress.duration)
  ) {
    setSavedProgress(progress);
    setShowContinueWatching(true);
  }
}, [location, navigate, clearAutoPlayTimers, id]);
`

---

### 4. HLS Video Player Setup

**File**: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx

`javascript
useEffect(() => {
  const video = videoRef.current;
  if (!video || !currentEp?.link_m3u8) return;

  // Cleanup previous HLS instance
  if (hlsRef.current) {
    hlsRef.current.destroy();
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(currentEp.link_m3u8);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch((err) => console.log("Auto-play prevented:", err));
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.error("HLS Error:", data);
        // Fallback to embed link
        if (currentEp.link_embed) {
          video.src = currentEp.link_embed;
        }
      }
    });

    hlsRef.current = hls;
  } else {
    // Fallback for non-HLS browsers
    video.src = currentEp.link_m3u8;
  }

  return () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
  };
}, [currentEp]);
`

---

### 5. Episode Navigation (Previous/Next)

**File**: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx

`javascript
// Get current episode index
const getCurrentEpisodeIndex = useCallback(() => {
  if (!item?.episodes?.[0]?.server_data || !currentEp) return -1;
  return item.episodes[0].server_data.findIndex(
    (ep) => ep.name === currentEp.name
  );
}, [item, currentEp]);

// Go to previous episode
const handlePrevEpisode = useCallback(() => {
  const currentIndex = getCurrentEpisodeIndex();
  if (currentIndex > 0) {
    const prevEp = item.episodes[0].server_data[currentIndex - 1];
    handleSelectEpisode(prevEp);
  }
}, [getCurrentEpisodeIndex, item, handleSelectEpisode]);

// Go to next episode
const handleNextEpisode = useCallback(() => {
  const currentIndex = getCurrentEpisodeIndex();
  if (
    currentIndex !== -1 &&
    currentIndex < item.episodes[0].server_data.length - 1
  ) {
    const nextEp = item.episodes[0].server_data[currentIndex + 1];
    handleSelectEpisode(nextEp);
  }
}, [getCurrentEpisodeIndex, item, handleSelectEpisode]);
`

---

### 6. Auto-Play Next Episode

**File**: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx

`javascript
// Auto-play next episode when video ends
useEffect(() => {
  if (!videoRef.current) return;

  const handleVideoEnded = () => {
    if (!autoPlayEnabled) return;

    const currentIndex = getCurrentEpisodeIndex();
    if (
      currentIndex !== -1 &&
      currentIndex < item?.episodes?.[0]?.server_data?.length - 1
    ) {
      // Show countdown notification
      setShowAutoPlayNotice(true);
      let countdown = 5;
      setAutoPlayCountdown(countdown);

      // Countdown timer
      countdownIntervalRef.current = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          // Auto-play next episode
          handleNextEpisode();
          clearAutoPlayTimers();
        } else {
          setAutoPlayCountdown(countdown);
        }
      }, 1000);
    }
  };

  videoRef.current.addEventListener("ended", handleVideoEnded);
  return () => videoRef.current?.removeEventListener("ended", handleVideoEnded);
}, [autoPlayEnabled, currentEp, item, handleNextEpisode, getCurrentEpisodeIndex]);
`

---

### 7. Watch Progress Tracking

**File**: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx

`javascript
import { saveWatchProgress, getWatchProgress } from "../../utils/watchHistoryManager";

// Save progress periodically
useEffect(() => {
  if (!videoRef.current || !currentEp) return;

  const saveProgress = () => {
    saveWatchProgress(
      id,
      currentEp.name,
      videoRef.current.currentTime,
      videoRef.current.duration,
      {
        title: item?.title,
        poster: item?.poster_url,
        slug: item?.slug,
      }
    );
  };

  // Save progress every 30 seconds
  saveProgressIntervalRef.current = setInterval(saveProgress, 30000);

  return () => {
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
    }
    // Final save on cleanup
    saveProgress();
  };
}, [id, currentEp, item]);

// Show "Continue Watching" option
const handleContinueWatching = useCallback(() => {
  if (videoRef.current && savedProgress) {
    videoRef.current.currentTime = savedProgress.currentTime;
    setShowContinueWatching(false);
    setSavedProgress(null);
  }
}, [savedProgress]);
`

---

### 8. EpisodeScroll Component Usage

**File**: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx

`javascript
import EpisodeScroll from "../../components/episode-scroll/EpisodeScroll";

// Render episode list
{item.episode_current !== "Trailer" && item.episodes && (
  <EpisodeScroll
    episodes={item.episodes[0].server_data}
    currentEpisode={currentEp}
    onSelectEpisode={handleSelectEpisode}
  />
)}
`

---

### 9. Fetching Movie List

**File**: E:\website-ophim\web-o-phim\src\pages\Home.jsx or components

`javascript
import tmdbApi, { movieType } from "../../api/tmdbApi";

// Get new movies
const response = await tmdbApi.getMoviesList(
  movieType.phimMoi,
  {
    page: 1,
    limit: 30,
  }
);

// Structure
const movies = response.data.items; // Array of movies
const pagination = response.data.params.pagination; // { totalItems, totalItemsPerPage, currentPage }

// Each movie has:
{
  slug: "phim-co-ten",
  title: "Phim có tên",
  poster_url: "...",
  episode_total: "12",
  episode_current: "Đang phát",
  tmdb: {
    vote_average: 8.5,
    vote_count: 1000,
    popularity: 850
  }
}
`

---

### 10. Search Movies

**File**: E:\website-ophim\web-o-phim\src\components\movie-grid\MovieGrid.jsx

`javascript
import tmdbApi from "../../api/tmdbApi";

const response = await tmdbApi.search(props.category, {
  keyword: "search term",
  limit: 28,
  page: 1,
});

// Response structure same as getMoviesList
const searchResults = response.data.items;
`

---

### 11. Filter by Genre/Category

**File**: E:\website-ophim\web-o-phim\src\components\movie-grid\MovieGrid.jsx

`javascript
import tmdbApi from "../../api/tmdbApi";

const response = await tmdbApi.getListByType(genreSlug, {
  page: 1,
  limit: 28,
});

// Returns movies in that genre
`

---

### 12. Filter by Country

`javascript
import tmdbApi from "../../api/tmdbApi";

const response = await tmdbApi.getListByCountry(countrySlug, {
  page: 1,
  limit: 28,
});

// Returns movies from that country
`

---

### 13. Getting Cast Information

**File**: E:\website-ophim\web-o-phim\src\pages\detail\CastList.jsx

`javascript
import axiosClient from "../../api/axiosClient";

const response = await axiosClient.get(
  https://ophim1.com/v1/api/phim/{movieId}/peoples
);

const casts = response.data.peoples; // Array of cast objects
// Each cast: { name, profile_path, character, etc. }
`

---

### 14. Keyboard Navigation in EpisodeScroll

**File**: E:\website-ophim\web-o-phim\src\components\episode-scroll\EpisodeScroll.jsx

`javascript
// Automatically handled, no code needed in Detail.jsx
// EpisodeScroll handles:
// - ArrowRight: Next episode
// - ArrowLeft: Previous episode  
// - ArrowDown: 5 episodes forward
// - ArrowUp: 5 episodes backward
// - Home: First episode
// - End: Last episode
// - Enter/Space: Select focused episode

// Just pass the props:
<EpisodeScroll
  episodes={item.episodes[0].server_data}
  currentEpisode={currentEp}
  onSelectEpisode={handleSelectEpisode}
/>
`

---

### 15. Watch History Management

**File**: E:\website-ophim\web-o-phim\src\utils\watchHistoryManager.js

`javascript
import {
  saveWatchProgress,
  getWatchProgress,
  getWatchHistory,
  clearWatchHistory,
  getInProgressMovies,
} from "../../utils/watchHistoryManager";

// Save progress
saveWatchProgress(
  movieId,
  episodeName,
  currentTime,
  duration,
  movieInfo
);

// Get progress
const progress = getWatchProgress(movieId, episodeName);
// Returns: { key, movieId, episodeName, currentTime, duration, percentage, timestamp, movieInfo }

// Get all history
const allHistory = getWatchHistory();

// Get movies in progress (5-95% watched)
const inProgress = getInProgressMovies();

// Clear all history
clearWatchHistory();

// Check if should show "Continue Watching"
const shouldShow = shouldShowContinueWatching(currentTime, duration);
`

---

## ROUTING EXAMPLES

### Navigate to Movie Detail
`javascript
import { Link } from 'react-router-dom';

// By movie slug
<Link to={/movie/}>
  View Details
</Link>

// Programmatic navigation
navigate(/movie/);
`

### Navigate with Episode Parameter
`javascript
// Navigate to specific episode
navigate(/movie/?ep=2);

// Get episode from URL
const query = new URLSearchParams(location.search);
const epFromUrl = query.get("ep");
`

### Navigate to Category
`javascript
// By genre/type
navigate(/the-loai/hanh-dong);

// By country
navigate(/quoc-gia/viet-nam);

// By category
navigate(/phim-moi);
`

### Navigate to Search
`javascript
navigate(/search/);
`

---

## STATE MANAGEMENT CHECKLIST

### Detail Page State Variables
- [ ] item - Movie data with episodes
- [ ] currentEp - Currently playing episode
- [ ] autoPlayEnabled - Auto-play next episode toggle
- [ ] showContinueWatching - Show resume option
- [ ] savedProgress - Saved watch progress
- [ ] autoPlayCountdown - Countdown timer display
- [ ] showAutoPlayNotice - Show countdown notification

### Movie List State Variables
- [ ] items - Array of movies
- [ ] page - Current page number
- [ ] totalPage - Total pages available
- [ ] title - Page title

---

## ERROR HANDLING PATTERNS

`javascript
// API call with error handling
try {
  const response = await tmdbApi.detail(category, id, {});
  const data = response.data.item;
  setItem(data);
} catch (error) {
  console.error('Error loading movie:', error);
  // Show error to user
}

// HLS error handling
hls.on(Hls.Events.ERROR, (event, data) => {
  if (data.fatal) {
    // Try fallback
    if (currentEp.link_embed) {
      video.src = currentEp.link_embed;
    }
  }
});

// Video playback error
video.addEventListener('error', (e) => {
  console.error('Video error:', e);
});
`

---

## PERFORMANCE OPTIMIZATION TIPS

1. **Use useMemo** for expensive computations
   - genresList
   - videoSource
   - movieTags

2. **Use useCallback** for callbacks
   - handleSelectEpisode
   - handleNextEpisode
   - handlePrevEpisode

3. **Lazy load images** with optimizeImage utility

4. **Debounce** watch progress saves (currently 30s intervals)

5. **Cleanup useEffect** subscriptions properly
   - Remove event listeners
   - Clear timers/intervals
   - Destroy HLS instances

