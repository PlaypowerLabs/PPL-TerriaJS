import { makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
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
import { deletePin, savePin, removePins } from "../../../lib/Core/db";
import Rectangle from "terriajs-cesium/Source/Core/Rectangle";

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
    data: MarkerDetails,
    createdat: Date
}

interface PinMetaData {
    color : string,
    id : string
}

interface IState {
    searchText : string;
    isRemoving : boolean,
    pinToRemove : Pin | undefined,
    pinRemoveIndex : number | undefined,
    pinWithOpenMenuId : number | undefined,
    editingMode: boolean;
    currentPin: Pin | undefined,
    searchState : boolean,
    searchedData : Pin[]
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
            isRemoving : false,
            pinRemoveIndex : undefined,
            pinToRemove : undefined,
            pinWithOpenMenuId : undefined,
            searchState : false,
            searchedData : []
        }
    }

    viewPin(pin : Pin) {
        const scene = this.props.viewState.terria.cesium?.scene;
        const latitude = pin.data.location.latitude;
        const longitude = pin.data.location.longitude;
        const position = Rectangle.fromDegrees(
            longitude - 2,
            latitude - 2,
            longitude + 2,
            latitude + 2
        );
        if (scene === undefined) {
            console.log("retuned");
            return;
        }
        this.props.viewState.terria.currentViewer.zoomTo(position);
        this.closeRemoving();
        this.props.viewState.togglePinsBuilder();
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
    async removeAction() {
        if (this.state.pinToRemove && this.state.pinRemoveIndex !== undefined) {
            await this.deleteSinglePin();
        } else {
            this.removeAllPins();
        }

        this.setState({
            pinToRemove: undefined,
            pinRemoveIndex: undefined
        });
    }

    closeRemoving() {
        this.setState({
            isRemoving : false
        })
    }

    @action.bound
    onSave(name : string, color : string, id : string) {
        const currentPin = this.state.currentPin;
        if (currentPin != undefined) {
            savePin(
                color, name, id, currentPin.data.location.longitude, 
                currentPin.data.location.latitude, true, this.props.viewState.terria.mainViewer.baseMap?.uniqueId!
            )
            this.setState({
                editingMode: false,
                currentPin : undefined
            });
        }
    }

    @action.bound
    async deleteSinglePin() {
        const currentPin = this.state.pinToRemove;
        if (currentPin != undefined) {
            if (await deletePin(currentPin.metadata.id)) {
                this.setState({
                    currentPin : undefined
                });
            }
        }
    }

    @action.bound
    async removeAllPins() {
        const basemap = this.props.viewState.terria.getLocalProperty("basemap") as string;
        if (basemap !== undefined && basemap !== null) {
            await removePins(basemap);
        }
        this.props.viewState.togglePinsBuilder();
    }

    render() {
        const { t, i18n } = this.props;

        const pinName = this.state.pinToRemove?.data.name;
        const pins = this.props.viewState.locationPins || [];

        const changeSearchText = (newText : string) => {
            this.setState({
                searchText : newText
            });

            const searchedText = newText.trim();
            if (searchedText.length === 0) {
                cancelSearch();
                return;
            }
            const filteredData = pins.filter((item, index) => {
                return item.data.name.includes(searchedText) || (
                    (item.data.location.latitude+","+item.data.location.longitude).includes(searchedText)
                );
            });
            this.setState({
                searchState : true,
                searchedData: filteredData
            })
        }
    
        const cancelSearch = () => {
            console.log("Cancelling");
            this.setState({
                searchText : "",
                searchState : false,
                searchedData : []
            })
        }

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
                        -ms-overflow-style: none;
                        scrollbar-width: none;  
                    `}
                >
                    {!this.state.searchState ? (
                        pins.map((item, index) =>
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
                        )
                    ):(
                        this.state.searchedData.map((item, index) =>
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
                        )
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

                {pins.length === 0 ? (
                    <Box flex={1} centered>
                        <Text large color={this.props.theme.textLightDimmed}>
                            {t("pin.emptyPin")}
                        </Text>
                    </Box>
                ) : (
                    <Box displayInlineBlock>
                        
                        <Box paddedHorizontally={2} paddedVertically={2}>
                            <SearchBox
                                onSearchTextChanged={(newText : string) => changeSearchText(newText)}
                                onDoSearch={() => { return 0; }}
                                searchText={this.state.searchText}
                                placeholder={"Search Pin..."}
                                onClear={() => cancelSearch()}
                            />
                        </Box>

                        <Spacing bottom={3} />

                        {!this.state.searchState && (
                            <BadgeBar
                                label={t("pin.badgeBarLabel")}
                                badge={pins.length}
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
                        )}
                        
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
                                                    count: pins.length
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
                                save={({ name, color, id  } : { name : string, color : string, id : string }) => this.onSave(name, color, id)}
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