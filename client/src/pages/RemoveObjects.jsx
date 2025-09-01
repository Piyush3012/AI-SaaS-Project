import { Scissors, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const RemoveObjects = () => {
         const [object,setObject]=useState('');
         const [input, setInput] = useState('');
         const [content,setContent]=useState(null);
         const [loading,setLoading]=useState(false);
         const { getToken } = useAuth();
        
        const onSubmitHandler=async(e)=>{
          e.preventDefault();
          try {
            setLoading(true);
            if(object.split(' ').length > 1 ){
              toast('Please enter only one object name');
              setLoading(false);
              return;
            }
            const formData = new FormData();
            formData.append('image',input);
            formData.append('object',object);

            const { data } = await axios.post('/api/ai/remove-image-object',formData,{
              headers:{
                "Content-Type": "multipart/form-data",
                Authorization:`Bearer ${await getToken()}`
              }
            })

            if(data.success){
              setContent(data.content);
            }
            else{
              console.log('something went wrong');
              
              toast.error(data.error)
            }
            setLoading(false);

          } catch (error) {
            console.log(error);
            toast.error(error.message);
            
          }
         
        }
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7aff]' />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>
         Upload Image
        </p>
        <input
          type="file"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          required
          onChange={(e) => setInput(e.target.files[0])}
          rows={4}
          accept='image/*'
        />
        <p className='mt-6 text-sm font-medium'>Describe Object name to remove</p>
        
        <textarea
          type="text"
          value={object}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='e.g., watch or spoon, Only single object name' required
          onChange={(e) => setObject(e.target.value)}
          rows={4}
        />
       
        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417Df6] to-[#8e37eb] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer '>
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Scissors className='w-5'></Scissors>
          }
          Remove Object
        </button>
      </form>
      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 '>
        <div className='flex items-center gap-3 '>
          <Scissors className='w-5 h-5 text-[#4a7aff]'></Scissors>
          <h1 className='text-xl font-semibold'>Processed Images</h1>
        </div>
          {
            !content ? 
            (<div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-5 h-5'></Scissors>
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
        </div>) : 
            (
              <div className='mt-3 h-full'>
                <img src={content} alt="image" className='w-full h-full '/>
              </div>
            )
          }
        
      </div>
    </div>
  )
}

export default RemoveObjects