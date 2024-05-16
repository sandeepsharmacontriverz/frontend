//SelectWrapper.jsx

import React, { useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Select from "react-select";
import AutoSizer from "react-virtualized-auto-sizer";

const SelectWrapper = (props: any) => {
  const {
    hasNextPage,
    isNextPageLoading,
    options,
    handleMenuClose,
    loadNextPage,
    placeholder,
    name,
    onChange,
    setSearchQuery,
    searchQuery,
    value,
  } = props;
  const [selectedOption, setSelectedOption] = useState(value);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const handleInputChange = (inputValue: any) => {
    setSearchQuery(inputValue);
  };

  console.error = () => { };
  // Extra row to hold a loading indicator if more options are present
  const itemCount = hasNextPage ? options.length + 1 : options.length;

  const loadMoreItems = isNextPageLoading ? () => { } : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: any) => !hasNextPage || index < options.length;

  const MenuList = ({ children }: any) => {
    if (children?.props?.children) {
      return <div className="text-sm p-3 font-semibold">No Data available</div>;
    } else {
      const childrenArray = React.Children.toArray(children);
      // Render an item or a loading indicator.
      const Item = ({ index, style, ...rest }: any) => {
        const child = childrenArray[index];

        return (
          <div
            className="drop-down-list"
            style={{
              borderBottom: "1px solid rgb(243 234 234 / 72%)",
              display: "flex",
              alignItems: "center",
              ...style,
            }}
            onClick={() => handleChange(options[index])}
            {...rest}
          >
            {isItemLoaded(index) && child ? child : `Loading...`}
          </div>
        );
      };

      return (
        <AutoSizer disableHeight>
          {({ width }) => (
            <InfiniteLoader
              isItemLoaded={(index) => index < options.length}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <List
                  className="List text-sm"
                  height={150}
                  itemCount={itemCount}
                  itemSize={45}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  width={width}
                  overscanCount={4} //The number of options (rows or columns) to render outside of the visible area.
                >
                  {Item}
                </List>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      );
    }
  };

  const handleChange = (selected: any) => {
    onChange(selected);
  };

  const handleMenu = () => {
    handleMenuClose(1);
  };

  return (
    <Select
      name={name}
      placeholder={placeholder}
      onMenuClose={handleMenu}
      components={{ MenuList }}
      value={selectedOption}
      options={options}
      inputValue={searchQuery}
      onInputChange={handleInputChange}
      onChange={handleChange}
      {...props}
    />
  );
};
export default SelectWrapper;
