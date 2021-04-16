import { useMemo } from 'react';
import type { NimbleEmojiIndex } from 'emoji-mart';

import { useChannelStateContext } from '../../../context/ChannelStateContext';
import { useComponentContext } from '../../../context/ComponentContext';

const useEmojiIndex = () => {
  const { emojiConfig } = useChannelStateContext();
  const { EmojiIndex } = useComponentContext();
  const { emojiData } = emojiConfig || {};

  const emojiIndex: NimbleEmojiIndex | null = useMemo(() => {
    if (EmojiIndex) {
      // @ts-expect-error type here isn't registering the constructor type
      return new EmojiIndex(emojiData);
    }
    return null;
  }, [emojiData, EmojiIndex]);

  return emojiIndex;
};

export default useEmojiIndex;
