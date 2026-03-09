import { useQuery, type UseQueryResult } from "react-query"
import { contentApi } from "../services/api"
import { type YoutubeLatestContentResponse } from "../types"

export const useLatestYoutubeContent = (): UseQueryResult<
  YoutubeLatestContentResponse,
  Error
> => {
  return useQuery<YoutubeLatestContentResponse, Error>(
    ["content", "youtube", "latest"],
    () => contentApi.getLatestYoutubeVideo(),
    {
      staleTime: 300_000,
      cacheTime: 600_000,
      retry: 1,
    },
  )
}
