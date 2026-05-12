# WEB-O-PHIM: FILM & EPISODES LOADING ARCHITECTURE

## Project Overview
- **Project Name**: Ổ Phim (Web-O-Phim)
- **Type**: React-based movie streaming application
- **API Base URL**: https://ophim1.com/
- **Framework**: React 18.3.1 with React Router v6
- **Video Player**: HLS.js for m3u8 streaming
- **Component Library**: Swiper for carousels

---

## DIRECTORY STRUCTURE

`
E:\website-ophim\web-o-phim\
├── src/
│   ├── api/                          # API Layer
│   │   ├── tmdbApi.js               # Main API endpoints
│   │   ├── apiConfig.js             # API configuration
│   │   └── axiosClient.js           # Axios HTTP client
│   ├── pages/
│   │   ├── Home.jsx                 # Homepage
│   │   ├── Catalog.jsx              # Movie catalog/listing
│   │   └── detail/
│   │       ├── Detail.jsx           # Movie detail page (MAIN - Episodes)
│   │       ├── VideoList.jsx        # Video trailers list
│   │       ├── CastList.jsx         # Cast/Actors list
│   │       └── detail.scss
│   ├── components/
│   │   ├── episode-scroll/
│   │   │   ├── EpisodeScroll.jsx    # EPISODE LIST COMPONENT
│   │   │   └── episode-scroll.scss
│   │   ├── movie-grid/              # Movie grid display
│   │   ├── movie-list/              # Movie carousel display
│   │   ├── movie-card/              # Single movie card
│   │   ├── hero-slide/              # Hero slider
│   │   └── similar-movies/          # Related movies
│   ├── utils/
│   │   ├── watchHistoryManager.js   # Watch progress tracking
│   │   ├── tmdbImageFetcher.js      # Image fetching utilities
│   │   └── optimizeImage.js         # Image optimization
│   └── config/
│       └── Routes.jsx               # Routing configuration
`

---

## API ENDPOINTS & HANDLERS

### File: E:\website-ophim\web-o-phim\src\api\tmdbApi.js

#### Main API Functions:

1. **getMoviesList(type, params)** - Get list of movies by type
   - URL: /v1/api/danh-sach/{type}
   - Types: phim-chieu-rap, phim-moi, hoat-hinh, phim-le, phim-bo
   - Returns: { data: { items: [], params: { pagination: {} } } }

2. **getListByType(type, params)** - Get movies by genre/category
   - URL: /v1/api/the-loai/{type}
   - Returns: Categorized movies

3. **getListByCountry(type, params)** - Get movies by country
   - URL: /v1/api/quoc-gia/{type}
   - Returns: Country-filtered movies

4. **detail(cate, id, params)** - Get FULL MOVIE DETAILS (INCLUDING EPISODES)
   - URL: /v1/api/phim/{id}
   - Returns: { data: { item: { episodes: [], ...movieData } } }
   - **MOST IMPORTANT FOR EPISODES**

5. **getVideos(cate, id)** - Get video trailers
   - URL: /v1/api/phim/{id}
   - Returns: { results: [] }

6. **search(cate, params)** - Search movies
   - URL: /v1/api/tim-kiem
   - Params: { keyword, limit, page }

7. **credits(cate, id)** - Get cast information
   - URL: /v1/api/phim/{id}/peoples
   - Returns: { data: { peoples: [] } }

---

## EPISODES DATA STRUCTURE

### Response Format from /v1/api/phim/{id}

`javascript
{
  data: {
    item: {
      // Basic movie info
      slug: "string",
      title: "string",
      poster_url: "string",
      backdrop_url: "string",
      tmdb: {
        vote_average: number,
        vote_count: number,
        popularity: number
      },
      
      // Episode information
      episode_total: "string",          // e.g., "12"
      episode_current: "string",        // "Hoàn thành", "Đang phát", "Trailer"
      
      // MAIN EPISODES ARRAY - Server data
      episodes: [
        {
          server_name: "string",        // Server name (e.g., "sv1")
          server_data: [                // Array of episodes
            {
              name: "1",                // Episode number
              slug: "tap-1",
              link_m3u8: "https://...",  // HLS playlist URL
              link_embed: "https://..."  // Iframe embed URL
            },
            {
              name: "2",
              slug: "tap-2",
              link_m3u8: "https://...",
              link_embed: "https://..."
            }
            // ... more episodes
          ]
        }
      ],
      
      // Additional metadata
      quality: "HD",
      lang: "Vietsub",
      time: "45 phút",
      year: 2024,
      category: [
        { id: "1", name: "Hành động", slug: "hanh-dong" },
        // ... more genres
      ]
    }
  }
}
`

---

## MAIN FILM/EPISODES LOADING FILES

### 1. DETAIL.JSX (E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx)
**Purpose**: Main page component that loads and displays movie details with episodes

**Key Functions**:

- **getDetail() - Line 130**
  `javascript
  const getDetail = async () => {
    const response = await tmdbApi.detail(category, id, { params: {} });
    const data = response.data.item;
    setItem(data);
    
    // Extract episodes if not trailer
    if (data.episode_current !== "Trailer" && data.episodes?.[0]?.server_data) {
      let defaultEp = data.episodes[0].server_data[0];
      // Handle URL parameter for specific episode
      if (epFromUrl) {
        const found = data.episodes[0].server_data.find(e => e.name === epFromUrl);
        if (found) defaultEp = found;
      }
      setCurrentEp(defaultEp);
    }
  };
  `

- **getCurrentEpisodeIndex() - Line 79**
  - Returns current episode index in server_data array
  - Used for navigation between episodes

- **handleSelectEpisode(ep) - Line 180**
  - Sets current episode state
  - Updates URL parameter with episode name
  - Loads watch progress for selected episode
  - Scrolls video into view

- **handlePrevEpisode() - Line 224**
  - Navigate to previous episode in server_data array

- **handleNextEpisode() - Line 233**
  - Navigate to next episode in server_data array
  - Auto-play next episode when current ends (if enabled)

- **HLS Player Initialization - Line 270**
  `javascript
  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hls.loadSource(currentEp.link_m3u8);
    hls.attachMedia(video);
  }
  `
  - Loads HLS.js for m3u8 video streaming
  - Falls back to link_embed if HLS fails

**State Management**:
- item: Movie data with episodes
- currentEp: Currently selected episode object
- utoPlayEnabled: Auto-play next episode toggle
- showContinueWatching: Show resume watching option

---

### 2. EPISODESCROLL.JSX (E:\website-ophim\web-o-phim\src\components\episode-scroll/EpisodeScroll.jsx)
**Purpose**: Displays scrollable list of episodes, handles keyboard navigation

**Key Features**:
- Displays all episodes from server_data array
- Auto-scrolls to current playing episode
- Keyboard navigation (Arrow keys, Enter, Home, End)
- Supports TV remote control navigation
- Highlights active episode

**Props Received**:
`javascript
{
  episodes: item.episodes[0].server_data,  // Array of episode objects
  currentEpisode: currentEp,                // Current episode object
  onSelectEpisode: handleSelectEpisode      // Callback function
}
`

---

### 3. VIDEOLIST.JSX (E:\website-ophim\web-o-phim\src\pages\detail/VideoList.jsx)
**Purpose**: Loads and displays video trailers

**Function**:
`javascript
const getVideos = async () => {
  const res = await tmdbApi.getVideos(category, props.id);
  setVideos(res.results.slice(0, 5));
}
`

---

### 4. CASTLIST.JSX (E:\website-ophim\web-o-phim\src\pages\detail/CastList.jsx)
**Purpose**: Loads and displays cast/actors information

**Endpoint**:
`javascript
const response = await axiosClient.get(
  https://ophim1.com/v1/api/phim//peoples
);
setCasts(response.data.peoples.slice(0, 8));
`

---

## OTHER FILM LOADING PAGES

### 5. HOME.JSX (E:\website-ophim\web-o-phim\src\pages/Home.jsx)
**Purpose**: Homepage with movie listings and rankings

**Functions**:
- etchRankingData() - Fetches top-rated and top-viewed movies
- Uses 	mdbApi.getMoviesList(movieType.phimMoi, ...)
- Sorts by TMDB vote_average and popularity
- Displays in RankingSection component

---

### 6. CATALOG.JSX (E:\website-ophim\web-o-phim\src\pages/Catalog.jsx)
**Purpose**: Movie catalog/listing page with filters

**Features**:
- Movie grid display via MovieGrid component
- Category filtering
- Search functionality
- Pagination support
- SEO metadata (Helmet)

---

## COMPONENTS THAT LOAD FILMS

### 7. MOVIEGRID.JSX (E:\website-ophim\web-o-phim\src\components/movie-grid/MovieGrid.jsx)
**Purpose**: Main component for listing movies with pagination

**Functions**:
`javascript
const getList = async (pageNumber = 1) => {
  if (category === "the-loai") {
    response = await tmdbApi.getListByType(type, { page, limit: 28 });
  } else if (category === "quoc-gia") {
    response = await tmdbApi.getListByCountry(type, { page, limit: 28 });
  } else {
    response = await tmdbApi.getMoviesList(type, { page, limit: 28 });
  }
  // Extract pagination info
  const pagination = response.data.params?.pagination || {};
};
`

**Features**:
- Handles category, genre, country filtering
- Search with keyword
- Pagination with URL state
- Loads 28 items per page

---

### 8. MOVIELIST.JSX (E:\website-ophim\web-o-phim\src\components/movie-list/MovieList.jsx)
**Purpose**: Horizontal carousel of movies using Swiper

**Functions**:
`javascript
const getList = async () => {
  let response = null;
  if (props.type !== "similar") {
    response = await tmdbApi.getMoviesList(props.type, { params });
  } else {
    response = await tmdbApi.getListByType(props.category);
  }
  setItems(response.data.items);
};
`

---

### 9. HEROSLIDEJSX (E:\website-ophim\web-o-phim\src\components/hero-slide/HeroSlide.jsx)
**Purpose**: Large featured movie carousel on homepage

**Function**:
`javascript
const response = await tmdbApi.getMoviesList(movieType.phimChieuRap, { ... });
setMovieItems(response.data.items.slice(0, 10));
`

---

### 10. MOVIECARD.JSX (E:\website-ophim\web-o-phim\src\components/movie-card/MovieCard.jsx)
**Purpose**: Individual movie card component

**Loads**:
- Poster image via TMDB API
- Rating and vote count
- Quality badge
- Direct link to detail page

---

## WATCH HISTORY & PROGRESS TRACKING

### File: E:\website-ophim\web-o-phim\src\utils/watchHistoryManager.js

**Key Functions**:

1. **saveWatchProgress(movieId, episodeName, currentTime, duration, movieInfo)**
   - Saves watch progress to localStorage
   - Key format: ${movieId}_
   - Used in Detail.jsx for progress tracking

2. **getWatchProgress(movieId, episodeName)**
   - Retrieves saved watch progress
   - Shows "Continue Watching" option if 5-95% watched

3. **shouldShowContinueWatching(currentTime, duration)**
   - Determines if "Resume" button should be shown

4. **formatTime(seconds)**
   - Formats time for display

5. **getInProgressMovies()**
   - Returns list of currently watching movies (5-95% watched)

---

## ROUTING CONFIGURATION

### File: E:\website-ophim\web-o-phim\src/config/Routes.jsx

`javascript
Routes:
  / → Home (Latest & Top movies)
  /:category/:type → Catalog (List by category/type)
  /:category/search/:keyword → Catalog (Search results)
  /movie/:id → Detail (Movie detail + Episodes)
  /movie/:id?ep=2 → Detail (Specific episode)
`

---

## API CONFIGURATION

### File: E:\website-ophim\web-o-phim\src/api/apiConfig.js

`javascript
baseUrl: "https://ophim1.com/"
imageUrl: "https://img.ophim.live/uploads/movies/"
w500Image: "https://image.tmdb.org/t/p/w500/"
`

---

## AXIOS HTTP CLIENT

### File: E:\website-ophim\web-o-phim\src/api/axiosClient.js

**Features**:
- baseURL: https://ophim1.com/
- Automatic response.data extraction
- Query string serialization
- Error handling

---

## CRITICAL DATA PATHS

### Accessing Episodes:
`javascript
// Full episodes array
item.episodes[0].server_data

// Specific episode
item.episodes[0].server_data[0]

// Episode properties
{
  name: "1",           // Episode number as string
  slug: "tap-1",
  link_m3u8: "HLS URL",
  link_embed: "Iframe URL"
}
`

### Video Loading Priority:
1. **link_m3u8** (HLS streaming via HLS.js)
2. **link_embed** (Fallback - Iframe embed)

### Episode Navigation:
- Total episodes: item.episodes[0].server_data.length
- Current index: item.episodes[0].server_data.findIndex(ep => ep.name === currentEp.name)

---

## KEY STATE MANAGEMENT PATTERNS

### Detail Page State:
`javascript
const [item, setItem] = useState(null);                    // Movie data with episodes
const [currentEp, setCurrentEp] = useState(null);          // Current episode
const [autoPlayEnabled, setAutoPlayEnabled] = useState(true); // Auto-play toggle
const [showContinueWatching, setShowContinueWatching] = useState(false);
const [savedProgress, setSavedProgress] = useState(null);  // Resume point
`

### Movie List State:
`javascript
const [items, setItems] = useState([]);
const [page, setPage] = useState(1);
const [totalPage, setTotalPage] = useState(0);
const [title, setTitle] = useState("");
`

---

## USEEFFECTS & LOADING PATTERNS

### Detail Page - Load Movie Data:
`javascript
useEffect(() => {
  const getDetail = async () => {
    const response = await tmdbApi.detail(category, id, {});
    const data = response.data.item;
    setItem(data);
    // Initialize with first episode or URL parameter
  };
  getDetail();
}, [category, id, epFromUrl]);
`

### Load HLS Video:
`javascript
useEffect(() => {
  if (!currentEp?.link_m3u8) return;
  const hls = new Hls();
  hls.loadSource(currentEp.link_m3u8);
  hls.attachMedia(videoRef.current);
}, [currentEp]);
`

### Auto-play Next Episode:
`javascript
useEffect(() => {
  const handleEnded = () => {
    if (autoPlayEnabled) {
      // Start countdown and play next episode
      setShowAutoPlayNotice(true);
    }
  };
  videoRef.current?.addEventListener('ended', handleEnded);
}, [autoPlayEnabled, currentEp]);
`

---

## SUMMARY: FILM/EPISODES LOADING FLOW

`
┌─────────────────────────────────────────────────────────────┐
│ User navigates to /movie/:id → Detail Page                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ useEffect: tmdbApi.detail(category, id)                     │
│ → GET /v1/api/phim/{id}                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Response: {data: {item: {..., episodes: [...]}}}           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Parse Episodes: item.episodes[0].server_data[]              │
│ Set Initial Episode (from URL or first episode)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Check Watch Progress: getWatchProgress(movieId, episodeName)│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Render EpisodeScroll with episodes list                     │
│ Display video player with link_m3u8 or link_embed          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ User selects episode → handleSelectEpisode(ep)              │
│ Update currentEp state → Update URL → Scroll to video       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ HLS Player loads new link_m3u8                              │
│ Save watch progress periodically                            │
└─────────────────────────────────────────────────────────────┘
`

---

## IMPORTANT NOTES

1. **Episodes are stored in**: esponse.data.item.episodes[0].server_data
2. **Only first server used**: Currently using only episodes[0] (can support multiple servers)
3. **Episode identifier**: episode.name (not numeric, stored as string)
4. **URL state**: Episode selection updates URL params: /movie/:id?ep=episodeName
5. **Auto-play**: Configurable via localStorage key 'autoPlayEnabled'
6. **Watch progress**: Saved to localStorage with key ${movieId}_
7. **Fallback chain**: link_m3u8 → link_embed
8. **Keyboard support**: Full arrow key navigation in EpisodeScroll

