import type { AppProps } from 'next/app'

// @ts-expect-error: Bỏ qua lỗi TypeScript không nhận diện được file CSS
import "@workspace/ui/globals.css"

import "react-datepicker/dist/react-datepicker.css"
import "../styles/datepicker.css"

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
