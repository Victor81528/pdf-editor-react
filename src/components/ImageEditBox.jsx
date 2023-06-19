import useStore from '../store/index'
import styled from 'styled-components'
import { Rnd } from 'react-rnd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from "@fortawesome/free-solid-svg-icons";

const ImaageEditBox = (props) => {

    const store = useStore()

    const handleDragStop = (e, d) => {
        store.setImage(props.index, {x: d.x, y: d.y})
    }

    const handleResizeStop = (e, direction, ref, delta, position) => {
        store.setImage(props.index, {
            w: ref.clientWidth,
            h: ref.clientHeight,
            x: position.x,
            y: position.y
        })
    }

    const handleRemove = () => {
        store.removeImage(props.index)
    }

    return (
        <StyledEditBox>
            <StyledRnd
                size={{ width: store.images[props.index].w + 2, height: store.images[props.index].h + 2 }}
                position={{ x: store.images[props.index].x, y: store.images[props.index].y}}
                lockAspectRatio={true}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
            >
                <img src={store.images[props.index].url} alt="" />
                <StyledIBox onClick={handleRemove}>
                    <FontAwesomeIcon icon={faX} />
                </StyledIBox>
            </StyledRnd>
        </StyledEditBox>
    )
}

const StyledEditBox = styled.div`
    display: flex;
    position: absolute;
	justify-content: center;
	align-items: center;
    top: 0;
    left: 0;
    background-color: aqua;
`
const StyledIBox = styled.div`
    display: none;
    position: absolute;
    width: 18px;
    height: 18px;
    top: -9px;
    right: 5%;
    background-color: rgb(185, 185, 185);
    border-radius: 3px;
    cursor: pointer;
    z-index: 20;
    &:hover {
        background-color: rgb(204, 204, 204);
    }
`
const StyledRnd = styled(Rnd)`
    box-sizing: border-box;
    border: solid 1px rgba(139, 139, 139, 0);
    z-index: 10;
    &:hover {
        border: solid 1px #8b8b8b;
        ${StyledIBox} {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    img {
        width: 100%;
        object-fit: contain;
        -webkit-user-drag: none;
    }
`

export default ImaageEditBox