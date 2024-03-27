import { makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import {
  Trans,  
  withTranslation,
  WithTranslation
} from "react-i18next";
import styled, { DefaultTheme, withTheme } from "styled-components";
import Box from "../../Styled/Box";
import { RawButton } from "../../Styled/Button";
import Icon, { StyledIcon } from "../../Styled/Icon";
import Spacing from "../../Styled/Spacing";
import Text, { TextSpan } from "../../Styled/Text";
import measureElement, { MeasureElementProps } from "../HOCs/measureElement";
import { WithViewState, withViewState } from "../Context";
import triggerResize from "../../Core/triggerResize";
import { StoryButton } from "./StoryBuilder";
import { StoryItem } from "./StoriesItem";
import StoriesItemComponent from "./StoriesItem";
import { RemoveDialog } from "./StoryBuilder";
import StoriesItemEdior from "./StoriesItemEdior";
import { createStory, deleteStory, updateStory } from "terriajs/lib/Core/db";
import { db } from "../../../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

interface IState {
    isRemoving : boolean,
    storyItemToRemove : StoryItem | undefined,
    editingMode: boolean;
    currentStoryItem: StoryItem | undefined,
    storiesItem : StoryItem[],
    storyItemWithOpenMenuId : number | undefined,
}

interface IProps {
  isVisible?: boolean;
  animationDuration?: number;
  theme: DefaultTheme;
}


@observer
class StoriesBuilder extends React.Component<
  IProps & MeasureElementProps & WithTranslation & WithViewState, IState
> {

  storyItemWrapperRef = React.createRef<HTMLElement>();

  refToMeasure: any;

  storiesUnSubsciber: any;

  componentDidMount(): void {
      this.storiesUnSubsciber = onSnapshot(
        query(collection(db, "Stories"), orderBy("modified", "desc")),
        (snapshot) => {
          const storiesData =  [] as StoryItem[];
          snapshot.docs.map((doc) => {
            const item = {...doc.data()};
            const createdDate = new Date(item.created);
            item.created = createdDate.getDate() + "-" + (createdDate.getMonth() + 1) + "-" + createdDate.getFullYear();
            const modifiedDate = new Date(item.modified);
            item.modified = modifiedDate.getDate() + "-" + (modifiedDate.getMonth() + 1) + "-" + modifiedDate.getFullYear();
            item.id = doc.id;
            storiesData.push(item as StoryItem);
          });
          this.setState({ storiesItem : storiesData });
        }
      );
  }

  componentWillUnmount(): void {
    this.storiesUnSubsciber();
  }

  constructor(
    props: IProps & MeasureElementProps & WithTranslation & WithViewState
  ) {
    super(props);
    makeObservable(this);
    this.state = {
        isRemoving : false,
        storyItemToRemove : undefined,
        editingMode: false,
        currentStoryItem: undefined,
        storiesItem : [],
        storyItemWithOpenMenuId : undefined
    }
  }

  hideStoriesBuilder = () => {
    this.props.viewState.toggleStoriesBuilder();
    this.props.viewState.terria.currentViewer.notifyRepaintRequired();
    // Allow any animations to finish, then trigger a resize.
    setTimeout(function () {
      triggerResize();
    }, this.props.animationDuration || 1);
    this.props.viewState.toggleFeaturePrompt("stories", false, true);
  };

  openMenu(pinIndex: number | undefined) {
    this.setState({
      storyItemWithOpenMenuId: pinIndex
    });
  }

  
  toggleRemoveDialog = () => {
    this.setState({
      isRemoving: !this.state.isRemoving,
      storyItemToRemove: undefined,
    });
  };

  removeStoryItem = (index: number, item: StoryItem) => {
    this.setState({
      isRemoving: true,
      storyItemToRemove: item,
    });
  };

  @action.bound
  async removeAction() {
    if (this.state.storyItemToRemove !== undefined && await deleteStory(this.state.storyItemToRemove.id)) {
      this.setState({
        storyItemToRemove: undefined
      });
    }
  }

  openStoryItem = (item : StoryItem | undefined) => {
    this.props.viewState.toggleStoryBuilder();
    this.props.viewState.terria.currentViewer.notifyRepaintRequired();
    this.props.viewState.terria.setStoriesId(item!.id);
    // Allow any animations to finish, then trigger a resize.
    setTimeout(function () {
        triggerResize();
    }, this.props.animationDuration || 1);
    this.props.viewState.toggleFeaturePrompt("story", false, true);
  }

  renderStoriesItem = () => {
    return (
        <Box
            column 
            ref={this.storyItemWrapperRef as React.RefObject<HTMLDivElement>}
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
            {this.state.storiesItem.map((item, index) =>
                <StoriesItemComponent
                    key={index}
                    item={item}
                    editStoryItem={() => this.openStoiesItemEditor(item)}
                    openStoryItem={() => this.openStoryItem(item)}
                    deleteStoryItem={() => this.removeStoryItem(index, item)}
                    menuOpen={index === this.state.storyItemWithOpenMenuId}
                    openMenu={() => this.openMenu(index)}
                    closeMenu={() => this.openMenu(undefined)}
                    parentRef={this.storyItemWrapperRef}
                />
            )}
        </Box>
    );
  }

  openStoiesItemEditor = (item : StoryItem | undefined) => {
    this.setState({
        editingMode : true,
        currentStoryItem: item
    });
  }

  saveStory = (name : String) => {
    createStory(name);
    this.setState({
      editingMode: false
    })
  }

  saveUpdatedStory = (name : string, id : string | undefined) => {
    if (id !== undefined) {
      updateStory(name, id);
      this.setState({
        editingMode: false,
        currentStoryItem: undefined
      });
    }
  }

  render() {
    const { t, i18n } = this.props;
    const storyItemName = this.state.storyItemToRemove?.name;

    return (
      <Panel
        ref={(component: HTMLElement) => (this.refToMeasure = component)}
        isVisible={this.props.isVisible}
        isHidden={!this.props.isVisible}
        styledWidth={"320px"}
        styledMinWidth={"320px"}
        charcoalGreyBg
        column
      >
        <Box right>
          <RawButton
            css={`
              padding: 15px;
            `}
            onClick={this.hideStoriesBuilder}
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
            {t("story.title")}
          </Text>
          <Spacing bottom={2} />
          <Text medium color={this.props.theme.textLightDimmed} highlightLinks>
            {t("story.panelBody")}
          </Text>
          <Spacing bottom={3} />
          <StoryButton
            title={t("story.createStoriesBtn")}
            btnText={t("story.createStoriesBtn")}
            onClick={() => this.openStoiesItemEditor(undefined)}
            fullWidth
          >
            <StyledIcon glyph={Icon.GLYPHS.story} light styledWidth={"20px"} />
          </StoryButton>
          <Spacing bottom={4} />
        </Box>
        {this.state.isRemoving && (
            <Box paddedHorizontally={2}>
                <RemoveDialog
                    theme={this.props.theme}
                    fromPinBuilder={true}
                    text={
                        this.state.storyItemToRemove ? (
                            <Text textLight large>
                                  Deleting this story will permanently remove all its associated scenes.
                                  <br/>
                                    Are you sure you wish to delete 
                                    <TextSpan textLight large bold>
                                        {" "}{ storyItemName } 
                                    </TextSpan>
                                    ?
                            </Text>
                        ) : ( <Text></Text> )
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
            {this.renderStoriesItem()}
                            
        </Box>
        {this.state.editingMode && (
            this.state.currentStoryItem !== undefined ? (
                <StoriesItemEdior
                    exitEditingMode={() => this.setState({ editingMode: false })}
                    item={this.state.currentStoryItem}
                    save={({ name } : { name : string }) => { this.saveUpdatedStory(name, this.state.currentStoryItem!.id) }}
                    isAdd={false}
                />
            ):(
                <StoriesItemEdior
                    exitEditingMode={() => this.setState({ editingMode: false })}
                    save={({ name } : { name : string }) => { this.saveStory(name) }}
                    isAdd={true}
                />
            )
        )}
      </Panel>
    );
  }
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

export default withViewState(
  withTranslation()(withTheme(measureElement(StoriesBuilder)))
);