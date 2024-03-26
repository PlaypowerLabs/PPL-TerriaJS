import classNames from "classnames";
import { TFunction } from "i18next";
import React, { MouseEventHandler, useEffect, useRef } from "react";
import { sortable } from "react-anything-sortable";
import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";
import Box from "../../Styled/Box";
import { RawButton } from "../../Styled/Button";
import Icon, { StyledIcon } from "../../Styled/Icon";
import Ul from "../../Styled/List";
import Spacing from "../../Styled/Spacing";
import Text from "../../Styled/Text";

export interface StoryItem {
    name : String,
    created : String,
    modified : String,
    id : String
}

interface Props {
  item: StoryItem;
  editStoryItem: () => void;
  openStoryItem: () => void;
  deleteStoryItem: () => void;
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  parentRef: any;

  //props for react-anything-sortable
  className: any;
  style: any;
  onMouseDown(): void;
  onTouchStart(): void;
}

interface MenuProps extends Props {
  t: TFunction;
}

const StoryItemControl = styled(Box).attrs({
    centered: true,
    left: true,
    justifySpaceBetween: true
})``;

const StoryItemMenuButton = styled(RawButton)`
  color: ${(props) => props.theme.textDarker};
  background-color: ${(props) => props.theme.textLight};

  ${StyledIcon} {
    width: 35px;
  }

  svg {
    fill: ${(props) => props.theme.textDarker};
    width: 18px;
    height: 18px;
  }

  border-radius: 0;

  width: 114px;
  // ensure we support long strings
  min-height: 32px;
  display: block;

  &:hover,
  &:focus {
    color: ${(props) => props.theme.textLight};
    background-color: ${(props) => props.theme.colorPrimary};

    svg {
      fill: ${(props) => props.theme.textLight};
      stroke: ${(props) => props.theme.textLight};
    }
  }
`;

const hideList = (props: Props) => props.closeMenu();

const toggleMenu =
  (props: Props): MouseEventHandler<HTMLElement> =>
  (event) => {
    event.stopPropagation();
    props.openMenu();
};

const openStoryItem =
  (props: Props): MouseEventHandler<HTMLElement> =>
  (event) => {
    event.stopPropagation();
    props.openStoryItem();
    hideList(props);
};

const deleteStoryItem =
  (props: Props): MouseEventHandler<HTMLElement> =>
  (event) => {
    event.stopPropagation();
    props.deleteStoryItem();
    hideList(props);
};

const editStoryItem =
  (props: Props): MouseEventHandler<HTMLElement> =>
  (event) => {
    event.stopPropagation();
    props.editStoryItem();
    hideList(props);
};

const calculateOffset =
  (props: Props) => (storyItemRef: React.RefObject<HTMLElement>) => {
    const offsetTop = storyItemRef.current?.offsetTop || 0;
    const scrollTop = props.parentRef.current.scrollTop || 0;
    const heightParent =
      (storyItemRef.current?.offsetParent as HTMLElement)?.offsetHeight || 0;

    const offsetTopScroll = offsetTop - scrollTop + 25;
    if (offsetTopScroll + 125 > heightParent) {
      return `bottom ${offsetTopScroll + 125 - heightParent + 45}px;`;
    }
    return `top: ${offsetTopScroll}px;`;
};

const renderMenu = (props: MenuProps) => {
  const { t } = props;

  return (
    <Ul column>
      <li>
        <StoryItemMenuButton
          onClick={openStoryItem(props)}
          title={t("story.openStory")}
        >
          <StoryItemControl>
            <StyledIcon glyph={Icon.GLYPHS.viewStory} />
            <span>{t("story.open")}</span>
          </StoryItemControl>
        </StoryItemMenuButton>
      </li>
      <li>
        <StoryItemMenuButton
          onClick={editStoryItem(props)}
          title={t("story.editStory")}
        >
          <StoryItemControl>
            <StyledIcon glyph={Icon.GLYPHS.editStory} />
            <span>{t("story.edit")}</span>
          </StoryItemControl>
        </StoryItemMenuButton>
      </li>
      <li>
        <StoryItemMenuButton
          onClick={deleteStoryItem(props)}
          title={t("story.deleteStory")}
        >
          <StoryItemControl>
            <StyledIcon glyph={Icon.GLYPHS.cancel} />
            <span>{t("story.delete")}</span>
          </StoryItemControl>
        </StoryItemMenuButton>
      </li>
    </Ul>
  );
};

const StoryItemComponent = (props: Props) => {
  const storyItem = props.item;
  const theme = useTheme();
  const { t } = useTranslation();
  const storyItemRef = useRef<HTMLDivElement>(null);
  const closeHandler = () => {
    hideList(props);
  };

  useEffect(() => {
    window.addEventListener("click", closeHandler);
    return () => window.removeEventListener("click", closeHandler);
  });

  return (
    <>
      <Box
        ref={storyItemRef}
        paddedHorizontally={1} 
        paddedVertically={2} 
        verticalCenter 
        fullWidth
        position="static"
        className={classNames(props.className)}
        onMouseDown={props.onMouseDown}
        onTouchStart={props.onTouchStart}
      >

        <Box styledWidth={"80%"} column style={{ marginLeft: "20px" }}>
            <Text bold large  textLight>
                {storyItem.name}
            </Text>
            <Text semiBold textLight style={{ marginTop: "10px" }}>
                Created : {storyItem.created}
            </Text>
            <Text semiBold textLight style={{ marginTop: "10px" }}>
                Modified : {storyItem.modified}
            </Text>
        </Box>

        <MenuButton theme={theme} onClick={toggleMenu(props)}>
            <StyledIcon
                styledWidth="16px"
                light
                glyph={Icon.GLYPHS.menuDotted}
            />
        </MenuButton>
          
        {props.menuOpen && (
            <Box
                css={`
                position: absolute;
                z-index: 100;
                right: 20px;

                ${calculateOffset(props)(storyItemRef)}
                padding: 0;
                margin: 0;

                ul {
                    list-style: none;
                }
                `}
            >
                {renderMenu({ ...props, t })}
            </Box>
        )}
        </Box>
        <Spacing bottom={1} />
    </>
  );
};

const MenuButton = styled(RawButton)`
  padding: 0 10px 0 10px;
  min-height: 40px;
  border-radius: ${(props) => props.theme.radiusLarge};
  background: transparent;

  &:hover,
  &:focus {
    opacity: 0.9;
    background-color: ${(props) => props.theme.dark};
  }
`;

export default sortable(StoryItemComponent);