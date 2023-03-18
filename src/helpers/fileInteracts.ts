export const saveFile = (filename: string, blob: Blob) => {
  const a = document.createElement("a")
  a.download = filename
  a.href = URL.createObjectURL(blob)
  a.dataset.downloadurl = ["text/json", a.download, a.href].join(":")
  a.addEventListener("click", (e) => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000)
  })
  a.click()
}

export const jsonToBlob = (json: object): Blob =>
  new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  })
