import styled from 'styled-components'
import useStore from '../store/index'
import { PDFDocument } from 'pdf-lib'

const Selecet = () => {

    const store = useStore()

    const handleUpload = () => {
    
        const fileInput = document.createElement('input')
    
        fileInput.type = 'file'
        fileInput.accept = '.pdf'
        fileInput.onchange = async () => {
    
            const file = fileInput.files[0]
            const url = URL.createObjectURL(file)
    
            // 載入PDF
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
            const pdfDoc = await PDFDocument.load(existingPdfBytes)
            const pages = pdfDoc.getPages()
            const page = pages[0]
    
            const pdf = {
                name: file.name,
                url: url,
                width: page.getWidth(),
                height: page.getHeight()
            }
            store.addToPdfs(pdf)

            store.setComp('Editor')
        }
        fileInput.click()
    }

    const handleUploadMutiple = () => {

        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = '.pdf'
        fileInput.multiple = true
        fileInput.onchange = async () => {
            const files = fileInput.files
            const pdfs = []
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const url = URL.createObjectURL(file)
    
                // 載入PDF
                const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
                const pdfDoc = await PDFDocument.load(existingPdfBytes)
                const pages = pdfDoc.getPages()
                const page = pages[0]
    
                store.addToPdfs({
                    name: file.name,
                    url: url,
                    width: page.getWidth(),
                    height: page.getHeight()
                })
            }

            store.setComp('EditorMultiple')
        }
        fileInput.click()
    }

    return (
        <StyledSelect>
            <button onClick={handleUpload}>選擇PDF</button>
            <button onClick={handleUploadMutiple}>批次處理</button>
        </StyledSelect>
    )
}

const StyledSelect = styled.div`
    display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
    min-height: 100vh;
    > button {
        width: 80%;
        max-width: 576px;
        padding: 60px 0;
        margin: 30px;
        box-shadow: 6px 6px 16px rgba(0,0,0,0.3);
    }
`

export default Selecet
