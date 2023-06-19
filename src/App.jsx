import { useState } from 'react'
import './App.css'

import Home from './views/home'
import Loading from './components/Loading'

import useStore from './store/index.js'

const App = () => {
  
  const store = useStore()

  return (
    <>
      <Home></Home>
      {store.isLoading === true ? <Loading /> : null}
    </>
  )
}

export default App
