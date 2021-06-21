import React, { useCallback, useEffect, useState } from 'react';

import { ChannelOrUserResponse, isChannelOrUserResponse } from './utils';

import { Avatar } from '../Avatar/Avatar';
import { useBreakpoint } from '../Message/hooks/useBreakpoint';

import { useTranslationContext } from '../../context/TranslationContext';

import type { DefaultUserType } from '../../types/types';

export type DropdownContainerProps<Us extends DefaultUserType<Us> = DefaultUserType> = {
  results: ChannelOrUserResponse[];
  SearchResultItem: React.ComponentType<SearchResultItemProps<Us>>;
  selectResult: (user: ChannelOrUserResponse) => Promise<void> | void;
  focusedUser?: number;
};

const DefaultDropdownContainer = <Us extends DefaultUserType<Us> = DefaultUserType>(
  props: DropdownContainerProps<Us>,
) => {
  const { focusedUser, results, SearchResultItem = DefaultSearchResultItem, selectResult } = props;

  return (
    <div>
      {results.map((result: ChannelOrUserResponse, index: number) => (
        <SearchResultItem
          focusedUser={focusedUser}
          index={index}
          key={index}
          result={result}
          selectResult={selectResult}
        />
      ))}
    </div>
  );
};

export type SearchResultItemProps<Us extends DefaultUserType<Us> = DefaultUserType> = {
  index: number;
  result: ChannelOrUserResponse;
  selectResult: (user: ChannelOrUserResponse) => Promise<void> | void;
  focusedUser?: number;
};

const DefaultSearchResultItem = <Us extends DefaultUserType<Us> = DefaultUserType>(
  props: SearchResultItemProps<Us>,
) => {
  const { focusedUser, index, result, selectResult } = props;

  const focused = focusedUser === index;

  if (isChannelOrUserResponse(result)) {
    const channel = result;

    return (
      <div
        className={`str-chat__channel-search-result ${focused ? 'focused' : ''}`}
        onClick={() => selectResult(channel)}
      >
        <div className='result-hashtag'>#</div>
        <p className='channel-search__result-text'>{channel?.data?.name}</p>
      </div>
    );
  } else {
    return (
      <div
        className={`str-chat__channel-search-result ${focused ? 'focused' : ''}`}
        onClick={() => selectResult(result)}
      >
        <Avatar image={result?.image} />
        {result.name || result.id}
      </div>
    );
  }
};

export type SearchResultsProps<Us extends DefaultUserType<Us> = DefaultUserType> = {
  results: Array<ChannelOrUserResponse> | [];
  searching: boolean;
  selectResult: (result: ChannelOrUserResponse) => Promise<void> | void;
  DropdownContainer?: React.ComponentType<DropdownContainerProps<Us>>;
  popupResults?: boolean;
  SearchEmpty?: React.ComponentType;
  SearchLoading?: React.ComponentType;
  SearchResultItem?: React.ComponentType<SearchResultItemProps<Us>>;
  SearchResultsHeader?: React.ComponentType;
};

export const SearchResults = <Us extends DefaultUserType<Us> = DefaultUserType>(
  props: SearchResultsProps<Us>,
) => {
  const {
    DropdownContainer = DefaultDropdownContainer,
    popupResults,
    results,
    searching,
    SearchEmpty,
    SearchResultsHeader,
    SearchLoading,
    SearchResultItem = DefaultSearchResultItem,
    selectResult,
  } = props;

  const { t } = useTranslationContext();

  const [focusedUser, setFocusedUser] = useState<number>();

  const { device } = useBreakpoint();

  const containerStyle = popupResults && device === 'full' ? 'popup' : 'inline';

  const ResultsContainer: React.FC = ({ children }) => (
    <div className={`str-chat__channel-search-container ${containerStyle}`}>{children}</div>
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        setFocusedUser((prevFocused) => {
          if (prevFocused === undefined) return 0;
          return prevFocused === 0 ? results.length - 1 : prevFocused - 1;
        });
      }

      if (event.key === 'ArrowDown') {
        setFocusedUser((prevFocused) => {
          if (prevFocused === undefined) return 0;
          return prevFocused === results.length - 1 ? 0 : prevFocused + 1;
        });
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (focusedUser !== undefined) {
          selectResult(results[focusedUser]);
          return setFocusedUser(undefined);
        }
      }
    },
    [focusedUser],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (searching) {
    return (
      <ResultsContainer>
        {SearchLoading ? (
          <SearchLoading />
        ) : (
          <div className='str-chat__channel-search-container-searching'>{t('Searching...')}</div>
        )}
      </ResultsContainer>
    );
  }

  if (!results.length) {
    return (
      <ResultsContainer>
        {SearchEmpty ? (
          <SearchEmpty />
        ) : (
          <div className='str-chat__channel-search-container-empty'>{t('No results found')}</div>
        )}
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      {SearchResultsHeader && <SearchResultsHeader />}
      <DropdownContainer
        focusedUser={focusedUser}
        results={results}
        SearchResultItem={SearchResultItem}
        selectResult={selectResult}
      />
    </ResultsContainer>
  );
};
