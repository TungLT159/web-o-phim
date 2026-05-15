import { act, renderHook } from "@testing-library/react";
import { useEpisodeCatalog } from "./useEpisodeCatalog";

const itemWithTwoGroups = {
  episode_current: "Tập 2",
  episodes: [
    {
      server_name: "Vietsub",
      server_data: [
        { name: "1", slug: "tap-1" },
        { name: "2", slug: "tap-2" },
      ],
    },
    {
      server_name: "Thuyết minh",
      server_data: [{ name: "1", slug: "tap-1" }],
    },
  ],
};

test("resolves the initial episode from the URL across grouped servers", () => {
  const { result } = renderHook(() =>
    useEpisodeCatalog(itemWithTwoGroups, "0:tap-2"),
  );

  expect(result.current.currentEpisode.name).toBe("2");
  expect(result.current.currentEpisodeIndex).toBe(1);
  expect(result.current.allEpisodeGroups[0].title).toBe("Vietsub");
});

test("selecting a flattened episode updates the current episode without rebuilding the item", () => {
  const { result } = renderHook(() =>
    useEpisodeCatalog(itemWithTwoGroups, "0:tap-2"),
  );

  act(() => {
    result.current.selectEpisode(result.current.episodeList[2]);
  });

  expect(result.current.currentEpisode.episodeGroupTitle).toBe("Thuyết minh");
  expect(result.current.currentEpisodeIndex).toBe(2);
});

test("preserves the selected episode when rebuilt item data still contains it", () => {
  const buildItem = () => ({
    ...itemWithTwoGroups,
    episodes: itemWithTwoGroups.episodes.map((server) => ({
      ...server,
      server_data: server.server_data.map((episode) => ({ ...episode })),
    })),
  });

  const { result, rerender } = renderHook(({ item }) => useEpisodeCatalog(item), {
    initialProps: { item: buildItem() },
  });

  act(() => {
    result.current.selectEpisode(result.current.episodeList[2]);
  });

  rerender({ item: buildItem() });

  expect(result.current.currentEpisode.episodeGroupTitle).toBe("Thuyết minh");
  expect(result.current.currentEpisodeIndex).toBe(2);
});
