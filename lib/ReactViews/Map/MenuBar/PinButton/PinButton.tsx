import React, { Ref } from "react";
import { useTranslation } from "react-i18next";
import { DefaultTheme } from "styled-components";

import triggerResize from "../../../../Core/triggerResize";
import Terria from "../../../../Models/Terria";
import ViewState from "../../../../ReactViewModels/ViewState";
import Icon from "../../../../Styled/Icon";
import { useRefForTerria } from "../../../Hooks/useRefForTerria";

import Styles from "./pin-button.scss";

interface Props {
  terria: Terria;
  theme: DefaultTheme;
  viewState: ViewState;
  animationDuration: number;
}

interface ButtonProps extends Props {
  ["aria-expanded"]: boolean;
}

const PIN_BUTTON_NAME = "MenuBarPinButton";

export const onPinButtonClick = (props: Props) => () => {
  props.viewState.togglePinsBuilder();
  props.terria.currentViewer.notifyRepaintRequired();
  // Allow any animations to finish, then trigger a resize.
  setTimeout(function () {
    triggerResize();
  }, props.animationDuration || 1);
  props.viewState.toggleFeaturePrompt("pin", false, true);
};

const PinButton = (props: Props) => {
  const pinButtonRef: Ref<HTMLButtonElement> = useRefForTerria(
    PIN_BUTTON_NAME,
    props.viewState
  );

  const { t } = useTranslation();

  return (
    <div>
      <button
        ref={pinButtonRef}
        className={Styles.pinBtn}
        type="button"
        onClick={onPinButtonClick(props)}
        aria-expanded={props.viewState.pinsBuilderShown}
        css={`
          ${(p: ButtonProps) =>
            p["aria-expanded"] &&
            `&:not(.foo) {
                      background: ${p.theme.colorPrimary};
                      svg {
                        fill: ${p.theme.textLight};
                      }
                    }`}
        `}
      >
        <Icon glyph={Icon.GLYPHS.pin} />
        <span>{t("pin.pin")}</span>
      </button>
    </div>
  );
};
export default PinButton;