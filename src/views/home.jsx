import styled from 'styled-components'
import useStore from '../store/index'

import Select from '../components/Select'
import Editor from '../components/Editor'
import EditorMultiple from '../components/EditorMultiple'

const Home = () => {

    const store = useStore()

    const componentMap = {
        Select: <Select />,
        Editor: <Editor />,
        EditorMultiple: <EditorMultiple />
    }

    return (
        <StyledHome>
            {componentMap[store.comp]}
        </StyledHome>
    )
}
const StyledHome = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 30px;
`

export default Home