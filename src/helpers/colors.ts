export const randomColor = () => "#" + Math.random().toString(16).slice(-6)

export const randomDarkColor = () => {
  let rgb = [Math.random() * 255, Math.random() * 255, Math.random() * 255].map(
    Math.round
  )
  if (rgb.filter((c) => c >= 128).length > 2) {
    rgb = rgb.map((c) => Math.max(0, (c - 128) * 2))
  }
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("")
}
