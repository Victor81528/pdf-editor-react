export const base64ToBlob = (base64) => {

    const binaryImg = atob(base64.split(',')[1])
    
    const byteNumbers = new Array(binaryImg.length)
    for (let i = 0; i < binaryImg.length; i++) {
        byteNumbers[i] = binaryImg.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/png' })

    return blob
}

export const blobToBase64 = async (objectUrl) => {

    // Fetch the blob data
    const response = await fetch(objectUrl)
    const blobData = await response.blob()
    
    // Convert blob to base64 string
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(blobData)
        reader.onloadend = () => {
            resolve(reader.result)
        }
    })
}
