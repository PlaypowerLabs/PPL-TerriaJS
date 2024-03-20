import { makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import {
  Trans,  
  withTranslation,
  WithTranslation
} from "react-i18next";
import styled, { DefaultTheme, withTheme } from "styled-components";
import triggerResize from "../../Core/triggerResize";
import Box from "../../Styled/Box";
import { RawButton } from "../../Styled/Button";
import Icon, { StyledIcon } from "../../Styled/Icon";
import Spacing from "../../Styled/Spacing";
import Text, { TextSpan } from "../../Styled/Text";
import { WithViewState, withViewState } from "../Context";
import ViewState from "../../ReactViewModels/ViewState";
import SearchBox from "../Search/SearchBox";
import Styles from "../Story/story-builder.scss";
import BadgeBar from "../BadgeBar";
import { RemoveDialog } from "../Story/StoryBuilder";
import PinComponent from "./Pin";
import PinEditor from "./PinEditor";
import { MarkerDetails } from "../../../lib/Models/LocationMarkerUtils";

interface IProps {
    isVisible?: boolean;
    animationDuration?: number;
    theme: DefaultTheme;
    viewState: ViewState
}

type PanelProps = React.ComponentPropsWithoutRef<typeof Box> & {
    isVisible?: boolean;
    isHidden?: boolean;
};
  
const Panel = styled(Box)<PanelProps>`
    transition: all 0.25s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    ${(props) =>
        props.isVisible &&
        `
        visibility: visible;
        margin-right: 0;
    `}
    ${(props) =>
        props.isHidden &&
        `
        visibility: hidden;
        margin-right: -${props.styledWidth ? props.styledWidth : "320px"};
    `}
`;

export interface Pin {
    metadata: PinMetaData,
    data: MarkerDetails
}

interface PinMetaData {
    color : string,
    id : string
}

interface IState {
    searchText : string;
    pins : Pin[],
    isRemoving : boolean,
    pinToRemove : Pin | undefined,
    pinRemoveIndex : number | undefined,
    pinWithOpenMenuId : number | undefined,
    editingMode: boolean;
    currentPin: Pin | undefined
}

@observer
class PinBuilder extends React.Component<
    IProps & WithTranslation & WithViewState, IState
>{
    pinWrapperRef = React.createRef<HTMLElement>();

    constructor(
        props: IProps & WithTranslation & WithViewState
    ) {
        super(props);
        makeObservable(this);
        this.state = {
            currentPin: undefined,
            editingMode: false,
            searchText:"",
            pins : [],
            isRemoving : false,
            pinRemoveIndex : undefined,
            pinToRemove : undefined,
            pinWithOpenMenuId : undefined
        }
    }

    viewPin(pin : Pin) {
        this.closeRemoving();
    }

    removePin = (index: number, pin: Pin) => {
        this.setState({
          isRemoving: true,
          pinToRemove: pin,
          pinRemoveIndex: index
        });
    };

    editPin(pin: Pin) {
        this.closeRemoving();
        this.setState({
            editingMode: true,
            currentPin: pin
        });
    }

    openMenu(pinIndex: number | undefined) {
        this.setState({
          pinWithOpenMenuId: pinIndex
        });
    }

    toggleRemoveDialog = () => {
        this.setState({
          isRemoving: !this.state.isRemoving,
          pinToRemove: undefined,
          pinRemoveIndex: undefined
        });
    };

    changeSearchText(newText : string) {
        this.setState({
            searchText : newText
        });
    }

    search() {

    }

    hidePinBuilder = () => {
        this.props.viewState.togglePinsBuilder();
        this.props.viewState.terria.currentViewer.notifyRepaintRequired();
        // Allow any animations to finish, then trigger a resize.
        setTimeout(function () {
          triggerResize();
        }, this.props.animationDuration || 1);
        this.props.viewState.toggleFeaturePrompt("pin", false, true);
    };

    @action.bound
    removeAction() {
        if (this.state.pinToRemove && this.state.pinRemoveIndex !== undefined) {
            
        } else {
            this.removeAllPins();
        }

        this.setState({
            pinToRemove: undefined,
            pinRemoveIndex: undefined
        });
    }

    @action.bound
    removeAllPins() {
    }

    closeRemoving() {
        this.setState({
            isRemoving : false
        })
    }

    onSave() {
        this.setState({
            editingMode: false
        });
    }

    render() {
        const { t, i18n } = this.props;

        const pinName = this.state.pinToRemove?.data.name;

        const renderPin = () => {
            return (
                <Box
                    column 
                    ref={this.pinWrapperRef as React.RefObject<HTMLDivElement>}
                    styledMaxHeight={"calc(100vh - 283px)"}  
                    scroll
                    overflowY={"auto"}
                    position="static"
                    css={`
                        ${(this.state.isRemoving) &&
                        `opacity: 0.3`}
                    `}
                >
                    {this.state.pins.map((item, index) =>
                        <PinComponent
                            key={index}
                            pin={item}
                            editPin={() => this.editPin(item)}
                            viewPin={() => this.viewPin(item)}
                            deletePin={() => this.removePin(index, item)}
                            menuOpen={index === this.state.pinWithOpenMenuId}
                            openMenu={() => this.openMenu(index)}
                            closeMenu={() => this.openMenu(undefined)}
                            parentRef={this.pinWrapperRef}
                        />
                    )}
                </Box>
            );
        }

        return (
            <Panel
                isVisible={this.props.isVisible}
                isHidden={!this.props.isVisible}
                styledWidth={this.props.viewState.useSmallScreenInterface ? "100vw" : "320px"}
                styledMinWidth={this.props.viewState.useSmallScreenInterface ? "100vw" : "320px"}
                charcoalGreyBg
                column
                position={this.props.viewState.useSmallScreenInterface ? "fixed" : "relative"}
                styledHeight={this.props.viewState.useSmallScreenInterface ? "100%" : "auto"}
                topLeft
                top={this.props.viewState.useSmallScreenInterface ? "51px" : "0px"}
                style={{
                    zIndex: 999
                }}
            >

                <Box right>
                    <RawButton
                        css={`
                            padding: 15px;
                        `}
                        onClick={this.hidePinBuilder}
                    >
                        <StyledIcon
                            styledWidth={"16px"}
                            fillColor={this.props.theme.textLightDimmed}
                            opacity={0.5}
                            glyph={Icon.GLYPHS.closeLight}
                        />
                    </RawButton>

                </Box>

                <Box centered paddedHorizontally={2} displayInlineBlock>
                    <Text bold extraExtraLarge textLight>
                        {t("pin.panelTitle")}
                    </Text>
                    <Spacing bottom={2} />
                    <Text medium color={this.props.theme.textLightDimmed} highlightLinks>
                        {t("pin.panelBody")}
                    </Text>
                    <Spacing bottom={3} />
                </Box>

                {this.state.pins.length === 0 ? (
                    <Box flex={1} centered>
                        <Text large color={this.props.theme.textLightDimmed}>
                            {t("pin.emptyPin")}
                        </Text>
                    </Box>
                ) : (
                    <Box displayInlineBlock>
                        
                        <Box paddedHorizontally={2} paddedVertically={2}>
                            <SearchBox
                                onSearchTextChanged={this.changeSearchText.bind(this)}
                                onDoSearch={this.search.bind(this)}
                                searchText={this.state.searchText}
                                placeholder={"Search Pin..."}
                            />
                        </Box>

                        <Spacing bottom={3} />

                        <BadgeBar
                            label={t("pin.badgeBarLabel")}
                            badge={this.state.pins.length}
                            >
                            <RawButton
                                type="button"
                                onClick={this.toggleRemoveDialog}
                                textLight
                                className={Styles.removeButton}
                            >
                                <Icon glyph={Icon.GLYPHS.remove} /> {t("pin.removeAllPins")}
                            </RawButton>
                        </BadgeBar>
                        <Spacing bottom={2} />
                        {this.state.isRemoving && (
                            <Box paddedHorizontally={2}>
                                <RemoveDialog
                                    theme={this.props.theme}
                                    fromPinBuilder={true}
                                    text={
                                        this.state.pinToRemove ? (
                                            <Text textLight large>
                                                <Trans i18nKey="pin.removePinDialog" i18n={i18n}>
                                                    Are you sure you wish to delete
                                                    <TextSpan textLight large bold>
                                                        {{ pinName }} 
                                                    </TextSpan>
                                                    ?
                                                </Trans>
                                            </Text>
                                        ) : (
                                            <Text textLight large>
                                                {t("pin.removeAllPinsDialog", {
                                                    count: this.state.pins.length
                                                })}
                                            </Text>
                                        )
                                    }
                                    onConfirm={this.removeAction}
                                    closeDialog={this.toggleRemoveDialog}
                                />
                            </Box>
                        )}
                        <Box
                            column
                            position="static"
                            css={`
                            ${(this.state.isRemoving) &&
                            `opacity: 0.3`}
                            `}
                        >
                            {renderPin()}
                            
                        </Box>

                        {this.state.editingMode && (
                            <PinEditor
                                exitEditingMode={() => this.setState({ editingMode: false })}
                                pin={this.state.currentPin}
                                save={this.onSave}
                            />
                        )}

                    </Box>
                    
                )}

            </Panel>
        );
    }
}

export default withViewState(
    withTranslation()(withTheme(PinBuilder))
);