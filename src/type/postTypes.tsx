type Post = {
    id: number;
    title: string;
    body: string;
  };
  
  type PostProps = {
    id: number;
    title: string;
    body: string;
    isNew: boolean;
    isSelected: boolean;
  };
  
  type CreatePostProps = {
    title: string;
    body: string;
  };
  
  export { Post, PostProps, CreatePostProps };
  