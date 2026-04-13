import { MessageCircle, ThumbsUp } from 'lucide-react'

const blogs = [
  {
    title: "My Amazing blog Title 1",
    author: "Jordan",
    likes: 120,
    comments: 45,
  },
  {
    title: "My Amazing blog Title 2",
    author: "John",
    likes: 153,
    comments: 25,
  },{
    title: "My Amazing blog Title 3",
    author: "HuXn",
    likes: 50,
    comments: 5,
  },{
    title: "My Amazing blog Title 4",
    author: "John Doe",
    likes: 120,
    comments: 45,
  }
]
const PopularBlogs = () => {
  return (
    <div className='bg-white p-5 w-92 mt-4 border ml-5 rounded'>
      <div className='text-xl font-bold mb-5'>Popular Blogs</div>
      <ul>
        {blogs.map((blog, index) => (
          <li key={index} className='mb-4'>
            <div className='flex justify-between items-center'>
              <span className='font-bold mb-2'>{blog.title}</span>
            </div>
            <span className='text-gray-600 '>
              Publish By {blog.author}
            </span>
            <div className='flex items-center mt-2'>
              <MessageCircle size={16}/>
              <span className='text-gray-500 mr-5 ml-1'>{blog.likes}</span>
            <ThumbsUp size={16} />
            <span className='text-gray-500 ml-1'>{blog.comments}</span>
            </div>
          </li>
        ))}

      </ul>
    </div>
  )
}

export default PopularBlogs
