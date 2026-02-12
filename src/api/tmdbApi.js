import axiosClient from "./axiosClient";
import apiConfig from "./apiConfig";

export const category = {
  movie: "movie",
  tv: "tv",
};

export const movieType = {
  phimChieuRap: "phim-chieu-rap",
  phimMoi: "phim-moi",
  phimHoatHinh: "hoat-hinh",
  phimLe: "phim-le",
};

export const tvType = {
  popular: "popular",
  top_rated: "top_rated",
  on_the_air: "on_the_air",
};

const tmdbApi = {
  getMoviesList: (type, params = {}) => {
    const url = `/v1/api/danh-sach/${type}`;
    return axiosClient.get(url, { params });
  },

  getListByType: (type, params) => {
    const url = "/v1/api/the-loai/" + type;
    return axiosClient.get(url, { params });
  },
  getListByCountry: (type, params) => {
    const url = "/v1/api/quoc-gia/" + type;
    return axiosClient.get(url, { params });
  },
  getVideos: (cate, id) => {
    // const url = category[cate] + '/' + id + '/videos';
    // return axiosClient.get(url, {params: {}});
    const url = "/v1/api/phim/" + id;
    return axiosClient.get(url);
  },
  getImage: (cate, id) => {
    const url = `/v1/api/phim/${id}/images`;
    return axiosClient.get(url);
  },
  search: (cate, params) => {
    const url = `/v1/api/tim-kiem`;
    return axiosClient.get(url, { params }); // ✅ bọc vào { params }
  },
  detail: (cate, id, params) => {
    const url = "/v1/api/phim/" + id;
    return axiosClient.get(url, params);
  },
  credits: (cate, id) => {
    const url = `/v1/api/phim/${id}/peoples`;
    return axiosClient.get(url, { params: {} });
  },
  similar: (cate, id) => {
    const url = category[cate] + "/" + id + "/similar";
    return axiosClient.get(url, { params: {} });
  },
};

export default tmdbApi;
