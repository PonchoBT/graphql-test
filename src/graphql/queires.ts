import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query Posts($options:PageQueryOptions  ) {
    posts(options: $options) {
      data {
        id
        title
        body
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const CREATE_POSTS = gql`
  mutation CreatePost($input:CreatePostInput! ) {
    createPost(input:$input) {
        id
        title
        body
        user {
          id
          name
          email
        }
     }
  }
`;

export const UPDATE_POSTS = gql`
  mutation UpdatePost($id:ID!, $input: UpdatePostInput! ) {
    updatePost(id:$id, input:$input) {
        id
        title
        body
        user {
          id
          name
          email
        }
    }
  }
`;

export const DELETE_POSTS= gql`
  mutation DeletePost($id:ID! ) {
    deletePost(id:$id)
  }
`;