import { useAuth, useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react'
import { dummyPublishedCreationData } from '../assets/assets';
import { Heart } from 'lucide-react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const community = () => {

  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-publish-creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if (data.success) {
        // Normalize likes to array
        const normalized = data.creations.map(c => ({
          ...c,
          likes: typeof c.likes === "string"
            ? c.likes.replace(/[{}]/g, "").split(",").filter(Boolean)
            : (c.likes || [])
        }));
        setCreations(normalized);

      }

      else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);

    }
    setLoading(false);
  }

  const imageLikeToggle = async (id) => {
    if (!user) return;

    // Optimistically update UI
    setCreations((prevCreations) =>
      prevCreations.map((creation) => {
        if (creation.id === id) {
          const hasLiked = creation.likes.includes(user.id);
          return {
            ...creation,
            likes: hasLiked
              ? creation.likes.filter((uid) => uid !== user.id)
              : [...creation.likes, user.id],
          };
        }
        return creation;
      })
    );

    try {
      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        // Optionally, you can fetch creations here if you want full sync,
        // but try to avoid it to prevent flicker:
        // await fetchCreations();
      } else {
        toast.error(data.message);
        // revert UI if error
        await fetchCreations();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      // revert UI if error
      await fetchCreations();
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user])
  return !loading ? (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      Creations
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
        {creations.map((creation, index) => (
          <div key={index} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
            <img src={creation.content} alt="" className='w-full h-full object-cover rounded-lg' />
            <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from transparent to-black/80 text-white rounded-lg'>
              <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
              <div className='flex gap-1 items-center'>
                <p>{creation.likes.length}</p>
                <Heart onClick={() => imageLikeToggle(creation.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${creation.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) :
  (
    <div className='flex justify-center items-center h-full'>
      <span className='w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin'></span>
    </div>
  )
}

export default community