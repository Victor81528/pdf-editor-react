import { useState } from 'react'
import useStore from '../store/index'
import styled from 'styled-components'
import ImageEditBox from './ImageEditBox'

import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { PDFDocument } from 'pdf-lib'

import { FreeMode, Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css'

import { blobToBase64 } from '../utils.js'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString()


const Editor = () => {

    const store = useStore()

    const [ pdfPage, setPdfPage ] = useState(1);
    const [ pdfNumPage, setPdfNumPage ] = useState(null)
    const [ pageNumberInput, setPageNumberInput ] = useState(1)
    const canvasWidth = () => {
        const canvasWidth = document.getElementsByTagName('canvas')[0].clientWidth
        return parseFloat(canvasWidth)
    }
    const canvasHeight = () => {
        const canvasHeight = document.getElementsByTagName('canvas')[0].clientHeight
        return parseFloat(canvasHeight)
    }
    const onDocumentLoadSuccess = ({numPages}) => setPdfNumPage(numPages)
    const handleChangePage = (n) => setPdfPage(pdfPage + n)
    const handleChangeNum = (event) => {
        setPageNumberInput(event.target.value)
    }
    const handleToPage = (event) => {

        if (event.key === 'Enter') {

            const value = parseInt(event.target.value, 10)
            setPdfPage(value)
            event.target.blur()
        }
    }
    const swiperBreakPoint = {
        576: {
            slidesPerView: 3
        },
        768: {
            slidesPerView: 4,
            spaceBetween: 20,
            allowTouchMove: false,
            freeMode: true
        },
        1200: {
            slidesPerView: 5,
            spaceBetween: 20,
            allowTouchMove: false,
            freeMode: true
        },
        1400: {
            slidesPerView: 5,
            spaceBetween: 18,
            allowTouchMove: false,
            freeMode: true
        }
    }

    // 加入新圖片
    const handleUploadImage = () => {
    
        const fileInput = document.createElement('input')
    
        fileInput.type = 'file'
        fileInput.accept = 'image/*'
        fileInput.onchange = () => {
            const file = fileInput.files[0]
    
            const img = new Image();
            if (file.type !== 'image/png') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const context = canvas.getContext('2d');
                        context.drawImage(img, 0, 0);
                        canvas.toBlob((blob) => {
                            const newFile = new File([blob], `${file.name}.png`, {type: 'image/png'});
                            const image = new Image();
                            image.src = URL.createObjectURL(newFile);
                            image.onload = () => {
                                const width = image.width;
                                const height = image.height;
                                store.addToImages({
                                    url: image.src,
                                    page: pdfPage,
                                    x: 0,
                                    y: 0,
                                    w: 300,
                                    h: 300 / width * height
                                })
                            }
                        }, 'image/png');
                    }
                    img.src = event.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                img.src = URL.createObjectURL(file);
                img.onload = () => {
    
                    const width = img.width;
                    const height = img.height;
            
                    store.addToImages({
                        url: img.src,
                        page: pdfPage,
                        x: 0,
                        y: 0,
                        w: 300,
                        h: 300 / width * height
                    })
                }
            }
        }
    
        fileInput.click()
    }
    // 將圖片渲染至PDF
    const handleAddImage = async (imgageInfo, pdfDoc) => {

        // 取得PDF頁數
        const pages = pdfDoc.getPages()
        const page = pages[imgageInfo.page - 1]
    
        const img = imgageInfo.url
    
        // 加載圖片
        const pngImageBytes = await fetch(img).then((res) => res.arrayBuffer())
    
        // 加入圖片
        const pngImage = await pdfDoc.embedPng(pngImageBytes)
    
        const scale = page.getWidth() / canvasWidth()
    
        // 圖片放置在PDF上的位置
        page.drawImage(pngImage, {
            x: imgageInfo.x * scale,
            y: (canvasHeight() - imgageInfo.y - imgageInfo.h) * scale,
            width:  imgageInfo.w * scale,
            height:  imgageInfo.h * scale
        })
    }
    const handleModifyPDF = async () => {
    
        store.setLoading(true)
        
        const url = store.pdfs[0].url
        
        // 加載PDF
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        
        // 迴圈處理所有圖片
        for (let i = 0; i < store.images.length; i++) {
            await handleAddImage(store.images[i], pdfDoc)
        }
        // imageStore.images = []
    
        // 將PDF轉成二進制或base64
        const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true })
        store.pdfs[0].url = pdfBytes
        
        store.setLoading(false)
    }
    const handleDownloadPDF = async () => {

        await handleModifyPDF()
    
        const link = document.createElement('a')
        link.href = store.pdfs[0].url
        link.download = `${store.pdfs[0].name}_signed.pdf`
        link.click()
    
        location.reload() 
    }
    // 將設定檔匯出
    const handleExport = async () => {

        let data = store.images
        
        data = JSON.parse(JSON.stringify(data))
        
        for (let i = 0; i < data.length; i++) {
            data[i].url = await blobToBase64(data[i].url)
            data[i].x_percents = data[i].x / canvasWidth()
            data[i].y_percents = data[i].y / canvasHeight()
            data[i].w_percents = data[i].w / canvasWidth()
            data[i].h_percents = data[i].h / canvasHeight()
        }
    
        const jsonData = JSON.stringify(data)
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'data.json'
        link.click()
    }
    // 匯入設定檔
    const handleImport = () => {
    
        const fileInput = document.createElement('input')
    
        fileInput.type = 'file'
        fileInput.accept = '.json'
        fileInput.onchange = () => {
    
            const file = fileInput.files[0]
            const reader = new FileReader()
    
            reader.onload = () => {
    
                const jsonStr = reader.result
                const jsonObj = JSON.parse(jsonStr)
    
                const res = jsonObj.some( (i) => i.page > pdfNumPage)
    
                if (res === true) alert('PDF不適用此設定檔，請檢查頁數等資訊')
                else {

                    for (let i = 0; i < jsonObj.length; i++) {
                        jsonObj[i].x = canvasWidth() * jsonObj[i].x_percents
                        jsonObj[i].y = canvasHeight() * jsonObj[i].y_percents
                        jsonObj[i].w = canvasWidth() * jsonObj[i].w_percents
                        jsonObj[i].h = canvasHeight() * jsonObj[i].h_percents
                    }
                    store.setAllImage(jsonObj)
                }
            }
    
            reader.readAsText(file)
        }
        fileInput.click()
    
    }

    return (
        <StyledEditor>
            <StyledPdfOuter>
                <StyledPdfNav>
                    <div>
                        <button disabled={pdfPage === 1} onClick={() => handleChangePage(-1)}>-</button>
                        <button disabled={pdfPage === pdfNumPage} onClick={() => handleChangePage(1)}>+</button>
                    </div>
                    <StyledPageInput>
                        <input type="number" min={1} max={pdfNumPage}
                            value={pageNumberInput}
                            onChange={handleChangeNum}
                            onKeyDown={handleToPage}
                        />
                        
                        <p> / { pdfNumPage }</p>
                    </StyledPageInput>
                </StyledPdfNav>

                <StyledPdfContent>
                    <StyledDocument file={store.pdfs[0]} onLoadSuccess={onDocumentLoadSuccess} >
                        <Page pageNumber={pdfPage}/>
                    </StyledDocument>
                    {store.images.map((item, index) => (
                        <ImageEditBox key={index} index={index} />
                    ))}
                </StyledPdfContent>
                <StyledSwiper
                    modules={[Navigation, FreeMode]}
                    spaceBetween={18}
                    slidesPerView={3}
                    navigation
                    freeMode
                    breakpoints={swiperBreakPoint}
                >
                    {store.images.map((item, index) => (
                        <StyledSwiperSlide key={index}>
                            <img src={item.url} alt="" />
                            <p>page: { item.page }</p>
                        </StyledSwiperSlide>
                    ))}

                </StyledSwiper>
            </StyledPdfOuter>
            <StyledBtns>
                {/* <button @click="isPadOpen = true">簽名</button> */}
                <button onClick={handleUploadImage}>上傳圖片</button>
                <button disabled={store.images.length === 0} onClick={handleDownloadPDF}>下載PDF</button>
                <button disabled={store.images.length === 0} onClick={handleExport}>匯出設定</button>
                <button onClick={handleImport}>匯入設定</button>
            </StyledBtns>
        </StyledEditor>
    )
}

const StyledEditor = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px 0;
`
const StyledPdfOuter = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
`
const StyledPdfNav = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 768px;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
    button {
        margin: 0;
        margin-right: 15px;
    }
`
const StyledPageInput = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
        display: block;
        width: 30px;
        height: 25px;
        margin-right: 5px;
        font-size: 16px;
    }
    p {
        margin: 0;
    }
`
const StyledPdfContent = styled.div`
    position: relative;
    width: 100%;
    max-width: 768px;
    overflow: hidden;
`
const StyledDocument = styled(Document)`
    canvas {
        width: 100% !important;
        height: auto !important;
    }
`
const StyledSwiper = styled(Swiper)`
    width: 100%;
    max-width: 1080px;
    margin: 15px 0;
    overflow: hidden;
    .swiper-wrapper {
        display: flex;
        align-items: center;
        height: 160px;
    }
`
const StyledSwiperSlide = styled(SwiperSlide)`
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
        width: 50%;
        flex-grow: 1;
        object-fit: contain;
        margin: 10px;
    }
    p {
        margin: 0;
    }
`
const StyledBtns = styled.div`
    display: flex;
    width: 100%;
    max-width: 768px;
    justify-content: space-between;
    margin: 15px 0;
    padding: 0 5px;
`

export default Editor
