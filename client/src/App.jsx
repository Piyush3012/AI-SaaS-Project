import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import DashBoard from './pages/DashBoard'
import WriteArticle from './pages/WriteArticle'
import BlogTitles from './pages/BlogTitles'
import GenerateImage from './pages/GenerateImages'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObjects from './pages/RemoveObjects'
import ReviewResume from './pages/ReviewResume'
import Community from './pages/Community'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast';
import Layout from './pages/Layout';



const App = () => {

  return (
    <div>
      <Toaster />
      <Routes>
      <Route path='/' element={<Home />}/>
 {/* nested Routes */}
      <Route path='/ai' element={<Layout />}>
      {/* this will open the index file as the dashboard page which will be default*/}
          <Route index element={<DashBoard/>}/> 
          <Route path='write-article' element={<WriteArticle/>}/>
          <Route path='blog-titles' element={<BlogTitles/>}/>
          <Route path='generate-image' element={<GenerateImage/>}/>
          <Route path='remove-background' element={<RemoveBackground/>}/>
          <Route path='remove-object' element={<RemoveObjects/>}/>
          <Route path='review-resume' element={<ReviewResume/>}/>
          <Route path='community' element={<Community/>}/>
      </Route> 

      </Routes>
    </div>
  )
}

export default App