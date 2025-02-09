import { ForumData, ForumTopic, Comment } from '../types';

// Load forum data from localStorage
export const loadForumData = (): ForumData => {
  const savedData = localStorage.getItem('forumData');
  if (!savedData) return { topics: [] };

  try {
    const parsedData = JSON.parse(savedData);
    return {
      topics: parsedData.topics.map((topic: any) => ({
        ...topic,
        createdAt: new Date(topic.createdAt),
        comments: topic.comments.map(parseComment)
      }))
    };
  } catch (error) {
    console.error('Error loading forum data:', error);
    return { topics: [] };
  }
};

// Save forum data to localStorage
export const saveForumData = (data: ForumData) => {
  localStorage.setItem('forumData', JSON.stringify(data));
};

// Helper function to parse dates in comments recursively
const parseComment = (comment: any): Comment => ({
  ...comment,
  createdAt: new Date(comment.createdAt),
  replies: comment.replies.map(parseComment)
});