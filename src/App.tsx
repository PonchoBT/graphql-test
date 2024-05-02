import "./App.css";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  useQuery,
  useMutation,
} from "@apollo/client";
import { useEffect, useState } from "react";
import { PostProps, CreatePostProps } from "./type/postTypes";
import {
  GET_POSTS,
  CREATE_POSTS,
  UPDATE_POSTS,
  DELETE_POSTS,
} from "./graphql/queires";

// Apollo client setup
const client = new ApolloClient({
  uri: "https://graphqlzero.almansi.me/api",
  cache: new InMemoryCache(),
});

// Component for displaying a single post
const PostItem = ({
  post,
  onClick,
  key,
}: {
  post: PostProps;
  key: number;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    key={key}
    className={`rounded-md px-2 py-1 mt-4 ${
      post.isSelected ? "bg-gray" : "bg-white"
    }`}
  >
    <h2>{post.title}</h2>
    <p className="text-dark-body text-sm m-0">{post.body}</p>
  </div>
);

// Modal component for creating or updating a post
const CreateUpdatePostModal = ({
  post,
  submit,
  isUpdatingPost,
  close,
}: {
  post?: PostProps;
  submit: (newPost: CreatePostProps) => void;
  isUpdatingPost: boolean;
  close: () => void;
}) => {
  const [newPost, setNewPost] = useState({ title: "", body: "" });

  useEffect(() => {
    if (post && isUpdatingPost) {
      setNewPost({ title: post.title, body: post.body });
    }
  }, [post, isUpdatingPost]);

  const handleChange = (field: string, value: string) => {
    setNewPost((prevState) => ({ ...prevState, [field]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="w-[50%] bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-2xl font-semibold mb-4">
          {isUpdatingPost ? "Update Post" : "Create Post"}
        </h3>
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter title..."
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPost.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Body
          </label>
          <textarea
            id="content"
            name="content"
            placeholder="Enter content..."
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPost.body}
            onChange={(e) => handleChange("body", e.target.value)}
          ></textarea>
        </div>
        <div className="flex justify-end mt-6">
          <button
            style={{ backgroundColor: "#fc3c17" }}
            className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out mr-4"
            onClick={close}
          >
            Cancel
          </button>
          <button
            style={{ backgroundColor: "#4CAF50" }}
            className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out"
            onClick={() => submit(newPost)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component of the application
const Main = () => {
  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: {
      options: { slice: { limit: 10 }, sort: { field: "id", order: "DESC" } },
    },
    onCompleted: () => {
      setPosts(
        data?.posts?.data.map((post: PostProps) => ({
          ...post,
          isSelected: false,
          isNew: false,
        }))
      );
    },
  });

  const [createPost] = useMutation(CREATE_POSTS);
  const [showUpdateCreateModal, setShowUpdateCreateModal] = useState(false);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [updatePost] = useMutation(UPDATE_POSTS);
  const [deletePost] = useMutation(DELETE_POSTS);

  const createOrUpdatePost = (newPost: CreatePostProps) => {
    if (isUpdatingPost) {
      const selectedPost = posts.find((post) => post.isSelected);
      if (selectedPost) {
        updatePost({ variables: { id: selectedPost.id, input: newPost } }).then(
          (result) => {
            if (result.data.updatePost) {
              setShowUpdateCreateModal(false);
              setIsUpdatingPost(false);
              const updatedPosts = [...posts];
              const index = updatedPosts.indexOf(selectedPost);
              updatedPosts[index] = result.data.updatePost;
              setPosts(updatedPosts);
            }
          }
        );
      }
    } else {
      createPost({ variables: { input: newPost } }).then((result) => {
        if (result.data.createPost) {
          setShowUpdateCreateModal(false);
          const updatedPosts = [...posts];
          updatedPosts.unshift({ ...result.data.createPost, isNew: true });
          setPosts(updatedPosts);
        }
      });
    }
  };

  // Render loading or error message if present
  if (loading)
    return (
      <div className="flex h-screen justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen justify-center items-center">
        <p>Error: {error.message}</p>
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-16 bg-header p-4">
        <h2 className="text-dark-body text-lg">Posts</h2>
      </header>
      {/* Main content */}
      <main className="flex-grow overflow-auto flex-col-reverse bg-body">
        <div className="px-4 py-4">
          {posts.map((post: PostProps, index: number) => (
            <PostItem
              onClick={() => {
                const updatedPosts = posts.map((p: PostProps, i: number) => ({
                  ...p,
                  isSelected: i === index ? !p.isSelected : false,
                }));
                setPosts(updatedPosts);
              }}
              key={index}
              post={post}
            />
          ))}
        </div>
      </main>
      {/* Footer */}
      <footer className="h-40 bg-header">
        <div className="px-2 py-4 flex flex-col gap-2">
          <div>
            <button
              className="bg-white text-dark-body text-sm px-4 py-2 border-light-body border-2 border-solid rounded-xl"
              onClick={() => {
                setIsUpdatingPost(false);
                setShowUpdateCreateModal(true);
              }}
            >
              Create a new post
            </button>
          </div>
          <div>
            <button
              className="bg-white text-dark-body text-sm px-4 py-2 border-light-body border-2 border-solid rounded-xl"
              onClick={() => {
                const selectedPost = posts.find((post) => post.isSelected);
                if (selectedPost) {
                  setIsUpdatingPost(true);
                  setShowUpdateCreateModal(true);
                }
              }}
            >
              Update post
            </button>
          </div>
          <div>
            <button
              className="bg-white text-dark-body text-sm px-4 py-2 border-light-body border-2 border-solid rounded-xl"
              onClick={() => {
                const selectedPost = posts.find((post) => post.isSelected);
                if (selectedPost) {
                  deletePost({ variables: { id: selectedPost.id } }).then(
                    (result) => {
                      if (result.data.deletePost) {
                        const updatedPosts = posts.filter(
                          (p) => p.id !== selectedPost.id
                        );
                        setPosts(updatedPosts);
                      }
                    }
                  );
                }
              }}
            >
              Delete post
            </button>
          </div>
        </div>
      </footer>
      {/* Create or update post modal */}
      {showUpdateCreateModal && (
        <CreateUpdatePostModal
          close={() => setShowUpdateCreateModal(false)}
          submit={(val: CreatePostProps) => {
            createOrUpdatePost(val);
          }}
          post={posts.find((post) => post.isSelected)}
          isUpdatingPost={isUpdatingPost}
        />
      )}
    </div>
  );
};

// App component
function App() {
  return (
    <ApolloProvider client={client}>
      <div className="container sm mx-auto">
        <Main />
      </div>
    </ApolloProvider>
  );
}

export default App;
