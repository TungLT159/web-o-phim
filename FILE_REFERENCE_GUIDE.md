# WEB-O-PHIM: FILE REFERENCE GUIDE

## COMPLETE FILE LISTING FOR FILM/EPISODES LOADING

### API Layer Files

#### 1. E:\website-ophim\web-o-phim\src\api\tmdbApi.js
**Description**: Core API interface with all endpoints
**Key Exports**:
- getMoviesList(type, params)
- getListByType(type, params)
- getListByCountry(type, params)
- detail(cate, id, params) - **MAIN EPISODES LOADER**
- getVideos(cate, id)
- search(cate, params)
- credits(cate, id)

#### 2. E:\website-ophim\web-o-phim\src\api\axiosClient.js
**Description**: Axios HTTP client with request/response interceptors
**Base URL**: https://ophim1.com/

#### 3. E:\website-ophim\web-o-phim\src\api\apiConfig.js
**Description**: API configuration and image URL formatters
**Config**:
- baseUrl: https://ophim1.com/
- Image URLs for poster and backdrops

---

### Page Components

#### 4. E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx ⭐⭐⭐
**Description**: MAIN PAGE FOR EPISODES DISPLAY AND PLAYBACK
**Critical Functions**:
- getDetail() - Loads movie data with episodes array
- getCurrentEpisodeIndex() - Gets current episode position
- handleSelectEpisode(ep) - Selects and plays episode
- handlePrevEpisode() - Previous episode navigation
- handleNextEpisode() - Next episode navigation
- HLS initialization for m3u8 streaming
- Watch progress tracking

**State Management**:
- item (movie data with episodes)
- currentEp (current episode object)
- autoPlayEnabled
- showContinueWatching
- savedProgress

**Imports Used**:
- tmdbApi for detail() endpoint
- EpisodeScroll component
- HLS.js for video playback
- watchHistoryManager for progress

**File Size**: 26,943 bytes | Lines: 773

#### 5. E:\website-ophim\web-o-phim\src\pages\detail\detail.scss
**Description**: Styling for Detail page

#### 6. E:\website-ophim\web-o-phim\src\pages\Home.jsx
**Description**: Homepage with movie rankings and listings
**Functions**:
- fetchRankingData() - Loads top-rated and top-viewed movies
- Uses getMoviesList(movieType.phimMoi)

#### 7. E:\website-ophim\web-o-phim\src\pages\Catalog.jsx
**Description**: Movie listing page with filtering and pagination
**Features**: Category filtering, search, pagination

#### 8. E:\website-ophim\web-o-phim\src\pages\detail\VideoList.jsx
**Description**: Loads and displays video trailers
**Endpoint**: getVideos(category, id)

#### 9. E:\website-ophim\web-o-phim\src\pages\detail\CastList.jsx
**Description**: Displays cast/actors list
**Endpoint**: /v1/api/phim/{id}/peoples

---

### Component Files - Episodes Handling

#### 10. E:\website-ophim\web-o-phim\src\components\episode-scroll\EpisodeScroll.jsx ⭐⭐
**Description**: EPISODE LIST COMPONENT with keyboard navigation
**Props**:
- episodes: array of episode objects
- currentEpisode: currently playing episode
- onSelectEpisode: callback when episode selected

**Features**:
- Renders scrollable episode list
- Keyboard navigation (Arrow keys, Enter, Home, End)
- Auto-scroll to current episode
- TV remote control support
- Active episode highlighting

**Keyboard Shortcuts**:
- ArrowRight: Next episode
- ArrowLeft: Previous episode
- ArrowDown: 5 episodes forward
- ArrowUp: 5 episodes backward
- Home: First episode
- End: Last episode
- Enter/Space: Select episode

**File Size**: 145 lines

#### 11. E:\website-ophim\web-o-phim\src\components\episode-scroll\episode-scroll.scss
**Description**: Episode scroll styling

#### 12. E:\website-ophim\web-o-phim\src\components\movie-grid\MovieGrid.jsx
**Description**: Main component for movie grid with pagination
**Functions**:
- getList(pageNumber) - Loads movies by category/type/country/search
- Handles pagination and URL state

**Supports**:
- getListByType (genre filtering)
- getListByCountry (country filtering)
- getMoviesList (general listing)
- search (keyword search)

#### 13. E:\website-ophim\web-o-phim\src\components\movie-list\MovieList.jsx
**Description**: Horizontal carousel of movies
**Features**:
- Swiper carousel display
- Auto-play movies
- Supports similar movies

#### 14. E:\website-ophim\web-o-phim\src\components\hero-slide\HeroSlide.jsx
**Description**: Featured movie carousel on homepage
**Data Source**: getMoviesList(movieType.phimChieuRap)

#### 15. E:\website-ophim\web-o-phim\src\components\movie-card\MovieCard.jsx
**Description**: Individual movie card component
**Loads**: Poster, rating, quality badge
**Data Source**: fetchTMDBImages for poster URL

#### 16. E:\website-ophim\web-o-phim\src\components\similar-movies\SimilarMovies.jsx
**Description**: Displays related/similar movies

---

### Utility Files

#### 17. E:\website-ophim\web-o-phim\src\utils\watchHistoryManager.js ⭐
**Description**: Watch progress tracking and history management
**Key Functions**:
- saveWatchProgress(movieId, episodeName, currentTime, duration, movieInfo)
- getWatchProgress(movieId, episodeName)
- shouldShowContinueWatching(currentTime, duration)
- formatTime(seconds)
- getWatchHistory()
- clearWatchHistory()
- getInProgressMovies()

**Storage**: localStorage with key 'ophim_watch_history'
**Used in**: Detail.jsx for resume watching feature

**File Size**: 167 lines

#### 18. E:\website-ophim\web-o-phim\src\utils\tmdbImageFetcher.js
**Description**: Fetches and formats TMDB image URLs

#### 19. E:\website-ophim\web-o-phim\src\utils\optimizeImage.js
**Description**: Image optimization utilities

#### 20. E:\website-ophim\web-o-phim\src\utils\seoHelpers.js
**Description**: SEO helper functions

---

### Configuration Files

#### 21. E:\website-ophim\web-o-phim\src\config\Routes.jsx
**Description**: React Router configuration
**Routes**:
- / → Home
- /:category/:type → Catalog
- /:category/search/:keyword → Catalog (search)
- /movie/:id → Detail
- /movie/:id?ep=2 → Detail (specific episode)

#### 22. E:\website-ophim\web-o-phim\src\constants\navigationData.js
**Description**: Navigation constants and menu data

---

### Entry Points

#### 23. E:\website-ophim\web-o-phim\src\App.js
**Description**: Root App component

#### 24. E:\website-ophim\web-o-phim\src\index.js
**Description**: React entry point

---

### Styling

#### 25. E:\website-ophim\web-o-phim\src\scss\
**Description**: Global SCSS files

#### 26. E:\website-ophim\web-o-phim\src\components\*/**.scss
**Description**: Component-specific styling

---

## QUICK REFERENCE: KEY FILES TO MODIFY/UNDERSTAND

### To understand Episodes loading:
1. Start: E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx (line 130)
2. API: E:\website-ophim\web-o-phim\src\api\tmdbApi.js (detail function)
3. UI: E:\website-ophim\web-o-phim\src\components\episode-scroll\EpisodeScroll.jsx

### To modify movie listings:
1. MovieGrid: E:\website-ophim\web-o-phim\src\components\movie-grid\MovieGrid.jsx
2. API: E:\website-ophim\web-o-phim\src\api\tmdbApi.js (getMoviesList, getListByType, etc.)
3. Pages: E:\website-ophim\web-o-phim\src\pages\Home.jsx, Catalog.jsx

### To add features to episodes:
1. Detail.jsx for logic
2. EpisodeScroll.jsx for UI
3. watchHistoryManager.js for persistence

### To modify watch progress:
1. Detail.jsx (saveWatchProgress calls)
2. watchHistoryManager.js (utility functions)

---

## DATA FLOW DIAGRAM

`
tmdbApi.detail(category, id)
         ↓
GET https://ophim1.com/v1/api/phim/{id}
         ↓
Response: {
  data: {
    item: {
      episodes: [{
        server_name: "sv1",
        server_data: [
          { name: "1", link_m3u8: "...", link_embed: "..." },
          { name: "2", link_m3u8: "...", link_embed: "..." }
        ]
      }]
    }
  }
}
         ↓
Detail.jsx receives and parses
         ↓
setItem(data)
setCurrentEp(episodes[0].server_data[0])
         ↓
EpisodeScroll renders episodes={episodes[0].server_data}
         ↓
HLS.js loads link_m3u8 or fallback to link_embed
         ↓
Watch progress saved to localStorage
`

---

## COMPONENT DEPENDENCY TREE

`
Routes (Entry)
├── Home
│   ├── HeroSlide → getMoviesList
│   ├── MovieList → getMoviesList/getListByType
│   └── RankingSection
├── Catalog
│   └── MovieGrid → getMoviesList/getListByType/getListByCountry/search
│       └── MovieCard
└── Detail ⭐ (Episodes)
    ├── EpisodeScroll ⭐
    ├── VideoList → getVideos
    ├── CastList → /peoples endpoint
    └── SimilarMovies
`

---

## ABSOLUTE FILE PATHS

`
E:\website-ophim\web-o-phim\src\api\tmdbApi.js
E:\website-ophim\web-o-phim\src\api\axiosClient.js
E:\website-ophim\web-o-phim\src\api\apiConfig.js

E:\website-ophim\web-o-phim\src\pages\detail\Detail.jsx
E:\website-ophim\web-o-phim\src\pages\detail\VideoList.jsx
E:\website-ophim\web-o-phim\src\pages\detail\CastList.jsx
E:\website-ophim\web-o-phim\src\pages\Home.jsx
E:\website-ophim\web-o-phim\src\pages\Catalog.jsx

E:\website-ophim\web-o-phim\src\components\episode-scroll\EpisodeScroll.jsx
E:\website-ophim\web-o-phim\src\components\movie-grid\MovieGrid.jsx
E:\website-ophim\web-o-phim\src\components\movie-list\MovieList.jsx
E:\website-ophim\web-o-phim\src\components\hero-slide\HeroSlide.jsx
E:\website-ophim\web-o-phim\src\components\movie-card\MovieCard.jsx
E:\website-ophim\web-o-phim\src\components\similar-movies\SimilarMovies.jsx

E:\website-ophim\web-o-phim\src\utils\watchHistoryManager.js
E:\website-ophim\web-o-phim\src\utils\tmdbImageFetcher.js
E:\website-ophim\web-o-phim\src\config\Routes.jsx
E:\website-ophim\web-o-phim\src\App.js
E:\website-ophim\web-o-phim\src\index.js
`

