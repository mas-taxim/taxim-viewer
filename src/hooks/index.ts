import { useEffect, useState } from "react"
import axios from "axios"

interface DynamicFetchResponse {
  url?: string
  data: any
  loading: boolean
  error: any
}

export const useDynamicFetch = (
  initialData: any = null
): [DynamicFetchResponse, (url: string) => void] => {
  const [url, setInternalUrl] = useState<string>()
  const [data, setData] = useState<any>(initialData)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()

  useEffect(() => {
    if (!url) {
      return
    }
    const fetchData = async () => {
      setError(null)
      setLoading(true)
      try {
        const result = await axios(url)
        setData(result.data)
      } catch (error) {
        setError(error)
      }
      setLoading(false)
    }
    fetchData()
  }, [url])

  const setUrl = (requestUrl: string) => setInternalUrl(requestUrl)
  return [{ url, data, loading, error }, setUrl]
}
