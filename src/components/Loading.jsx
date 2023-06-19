import styled, { keyframes } from 'styled-components'

const Loading = () => {

    

    return (
        <StyledOuter>
            <StyledRoller>
                <StyledLdio>
                    <StyledInner />
                </StyledLdio>
            </StyledRoller>
        </StyledOuter>
    )
}

const animationRoll = keyframes`
        0% { transform: translate(-50%,-50%) rotate(0deg); }
        100% { transform: translate(-50%,-50%) rotate(360deg); }
`
const StyledOuter = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(6px);
    z-index: 50;
`
const StyledRoller = styled.div`
    width: 80px;
    height: 80px;
    display: inline-block;
    overflow: hidden;
    background: rgba(241, 242, 243, 0);
`
const StyledLdio = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    transform: translateZ(0) scale(0.8);
    backface-visibility: hidden;
    transform-origin: 0 0;
`
const StyledInner = styled.div`
    position: absolute;
    width: 60px;
    height: 60px;
    border: 10px solid #1398df;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${animationRoll} 1s linear infinite;
    top: 50px;
    left: 50px;
    box-sizing: content-box;
`

export default Loading


// document.body.style.overflow = 'hidden'

// onUnmounted(() => {
// 	document.body.style.overflow = 'auto'
// })
