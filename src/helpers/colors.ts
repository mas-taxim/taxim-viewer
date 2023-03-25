export const randomColor = () => "#" + Math.random().toString(16).slice(-6)

export const randomLightColor = () => {
  const rgb = shuffleArray([
    Math.random() * 128 + 48,
    Math.random() * 128 + 80,
    Math.random() * 64 + 192
  ].map(Math.round));
  return arrayToHex(rgb)
}

export const randomDarkColor = () => {
  const rgb = shuffleArray([
    Math.random() * 64,
    Math.random() * 128,
    Math.random() * 64 + 128
  ].map(Math.round))
  return arrayToHex(rgb)
}

function arrayToHex(rgb: number[]) {
  return "#" + rgb.map((c: number) => c.toString(16).padStart(2, "0")).join("")
}

function shuffleArray(array: any[]) {
  const a = [...array]
  for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
  }
  return a
}
