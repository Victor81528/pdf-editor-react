import { PDFDocument } from 'pdf-lib'

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

export const handleModifyPDF = async (url, imgs, handleAddImage) => {
        
    // 加載PDF
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    
    // 迴圈處理所有圖片
    for (let i = 0; i < imgs.length; i++) {
        await handleAddImage(imgs[i], pdfDoc)
    }

    // 將PDF轉成二進制或base64
    const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true })
    return pdfBytes
}
