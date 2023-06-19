import styled from 'styled-components'
import useStore from '../store/index.js'

import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { FreeMode, Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css'

import JSZip from 'jszip'

import { handleModifyPDF } from '../utils.js'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString()

const EditorMultiple = () => {

    const store = useStore()

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

                store.setAllImage(jsonObj)
            }
    
            reader.readAsText(file)
        }
        fileInput.click()
    
    }
    // 將圖片加入PDF
    const handleAddImage = async (imgageInfo, pdfDoc) => {

        // 取得PDF頁數
        const pages = pdfDoc.getPages()
        const page = pages[imgageInfo.page - 1]
    
        const img = imgageInfo.url
    
        // 加載圖片
        const pngImageBytes = await fetch(img).then((res) => res.arrayBuffer())
    
        // 加入圖片
        const pngImage = await pdfDoc.embedPng(pngImageBytes)
    
        // 圖片放置在PDF上的位置
        page.drawImage(pngImage, {
            x: imgageInfo.x_percents * page.getWidth(),
            y: (1 - imgageInfo.y_percents - imgageInfo.h_percents) * page.getHeight(),
            width:  imgageInfo.w_percents * page.getWidth(),
            height:  imgageInfo.h_percents * page.getHeight(),
        })
    }
    const handleDownloadPDF = async () => {
    
        store.setLoading(true)

        for (let i = 0; i < store.pdfs.length; i++) {
            
            const url = await handleModifyPDF(
                store.pdfs[i].url,
                store.images,
                handleAddImage
            )
            store.pdfs[i].url = url
        }

        store.images = []

        const zip = new JSZip()

        for (let i = 0; i < store.pdfs.length; i++) {
            const pdf = store.pdfs[i]
            const pdfData = await fetch(pdf.url).then((res) => res.blob());
            zip.file(pdf.name, pdfData)
        }

        try {
            const content = await zip.generateAsync({ type: 'blob' })
            const downloadLink = document.createElement('a')
            downloadLink.href = URL.createObjectURL(content)
            downloadLink.download = 'files.zip'
            downloadLink.click()
        } catch (err) {
            alert(err)
        }

        store.setLoading(false)
        location.reload() 
    }

    return (
        <StyledEditMul>
            <StyledSwiper
                modules={[Navigation, FreeMode]}
                spaceBetween={18}
                slidesPerView={3}
                navigation
                freeMode
                breakpoints={swiperBreakPoint}
            >
                {store.pdfs.map((item, index) => (
                    <StyledSwiperSlide key={index}>
                        <StyledDocument file={item.url}>
                            <Page pageNumber={1}/>
                        </StyledDocument>
                    </StyledSwiperSlide>
                ))}

            </StyledSwiper>

            <StyledImgSwiper
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

            </StyledImgSwiper>

            <StyledBtns>
                <button onClick={handleImport}>選擇設定檔</button>
                <button disabled={store.images.length === 0} onClick={handleDownloadPDF}>下載PDF</button>
            </StyledBtns>
        </StyledEditMul>
    )
}
const StyledEditMul = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
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
    }
`
const StyledImgSwiper = styled(Swiper)`
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
    justify-content: center;
    margin: 15px 0;
    padding: 0 5px;
    button {
        margin: 0 7.5px;
    }
`

export default EditorMultiple
