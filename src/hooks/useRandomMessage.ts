import { useEffect, useState } from 'react';
import { COMMENT_MESSAGES, getRandomMessage } from '../utils/commonUtils';

export const useRandomMessage = () => {
  const [commentMessage, setCommentMessage] = useState('');

  useEffect(() => {
    const message = getRandomMessage(COMMENT_MESSAGES);
    setCommentMessage(message);
  }, []);

  return commentMessage;
};
