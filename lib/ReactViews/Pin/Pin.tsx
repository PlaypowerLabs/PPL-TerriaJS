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
import { Pin } from "./PinBuilder";

interface Props {
  pin: Pin;
  editPin: () => void;
  viewPin: () => void;
  deletePin: () => void;
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

const PinControl = styled(Box).attrs({
    centered: true,
    left: true,
    justifySpaceBetween: true
})``;

const PinMenuButton = styled(RawButton)`
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

const viewPin =
  (props: Props): MouseEventHandler<HTMLElement> =>
  (event) => {
    event.stopPropagation();
    props.viewPin();
    hideList(props);
};

const deletePin =
  (props: Props): MouseEventHandler<HTMLElement> =>
  (event) => {
    event.stopPropagation();
    props.deletePin();
    hideList(props);
};

const editPin =
  (props: Props): MouseEventHandler<HTMLElement> =>
  (event) => {
    event.stopPropagation();
    props.editPin();
    hideList(props);
};

const calculateOffset =
  (props: Props) => (pinRef: React.RefObject<HTMLElement>) => {
    const offsetTop = pinRef.current?.offsetTop || 0;
    const scrollTop = props.parentRef.current.scrollTop || 0;
    const heightParent =
      (pinRef.current?.offsetParent as HTMLElement)?.offsetHeight || 0;

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
        <PinMenuButton
          onClick={viewPin(props)}
          title={t("pin.viewPin")}
        >
          <PinControl>
            <StyledIcon glyph={Icon.GLYPHS.viewStory} />
            <span>{t("pin.view")}</span>
          </PinControl>
        </PinMenuButton>
      </li>
      <li>
        <PinMenuButton
          onClick={editPin(props)}
          title={t("pin.editPin")}
        >
          <PinControl>
            <StyledIcon glyph={Icon.GLYPHS.editStory} />
            <span>{t("pin.edit")}</span>
          </PinControl>
        </PinMenuButton>
      </li>
      <li>
        <PinMenuButton
          onClick={deletePin(props)}
          title={t("pin.deletePin")}
        >
          <PinControl>
            <StyledIcon glyph={Icon.GLYPHS.cancel} />
            <span>{t("pin.delete")}</span>
          </PinControl>
        </PinMenuButton>
      </li>
    </Ul>
  );
};

const PinComponent = (props: Props) => {
  const pin = props.pin;
  const theme = useTheme();
  const { t } = useTranslation();
  const pinRef = useRef<HTMLDivElement>(null);
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
        ref={pinRef}
        paddedHorizontally={2} 
        paddedVertically={3} 
        verticalCenter 
        fullWidth
        position="static"
        className={classNames(props.className)}
        onMouseDown={props.onMouseDown}
        onTouchStart={props.onTouchStart}
      >

        <svg width="36px" height="36px">
            <image href={pin.data.customMarkerIcon} width="36px" height="36px" />
        </svg>

        <Box styledWidth={"80%"} column style={{ marginLeft: "20px" }}>
            <Text bold large  textLight>
                {pin.data.name}
            </Text>
            <Text semiBold textLight style={{ marginTop: "10px" }}>
                Lat : {pin.data.location.latitude}
            </Text>
            <Text semiBold textLight style={{ marginTop: "10px" }}>
                Lon : {pin.data.location.longitude}
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

                ${calculateOffset(props)(pinRef)}
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

export default sortable(PinComponent);