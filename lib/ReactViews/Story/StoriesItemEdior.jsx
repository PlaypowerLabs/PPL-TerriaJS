import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Styles from "../Pin/pin-editor.scss";
import { withTranslation } from "react-i18next";
import Box from "../../Styled/Box";
import Text from "../../Styled/Text";

class StoriesItemEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    };

    this.keys = {
        ctrl: false,
        enter: false
    };

    this.save = this.save.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
  }

  /* eslint-disable-next-line camelcase */
  UNSAFE_componentWillMount() {
    const pin = this.props.item;
    this.setState({
      name: pin.name
    });
  }

  componentDidMount() {
    this.slideIn();
  }

  slideIn() {
    this.slideInTimer = setTimeout(() => {
      this.setState({
        inView: true
      });

      this.nameInput.focus();
    }, 300);
  }

  slideOut() {
    this.slideOutTimer = this.setState({
      inView: false
    });
    setTimeout(() => {
      this.cancelEditing();
    }, 300);
  }

  componentWillUnmount() {
    clearTimeout(this.slideInTimer);
    if (this.slideOutTimer) {
      clearTimeout(this.slideOutTimer);
    }
    this.setState({
        name: ''
    });
  }

  updateName(event) {
    this.setState({
      name: event.target.value
    });
  }

  save() {
    this.props.save({
      name: this.state.name
    });
  }

  cancelEditing() {
    this.props.exitEditingMode();
    this.setState({
      name: this.props.item.name,
    });
  }

  onKeyDown(event) {
    if (event.keyCode === 27) {
      this.cancelEditing();
    }
    if (event.keyCode === 13) {
      this.keys.enter = true;
    }
    if (event.keyCode === 17) {
      this.keys.ctrl = true;
    }
  }

  onKeyUp(event) {
    if (
      (event.keyCode === 13 || event.keyCode === 17) &&
      this.keys.enter &&
      this.keys.ctrl
    ) {
      this.save();
    }
    if (event.keyCode === 13) {
      this.keys.enter = false;
    }
    if (event.keyCode === 17) {
      this.keys.ctrl = false;
    }
  }

  renderPopupEditor() {
    const { t, isAdd } = this.props;
    return (
      <div
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        className={classNames(Styles.popupEditor, {
            [Styles.isMounted]: this.state.inView
        })}
      >
        <div className={Styles.inner}>
          <Text extraLarge style={{ marginLeft: "10px", marginTop: "10px", color: "#000000"  }}>
            {isAdd ? t("story.storyItemEditor.createStoryTitle") : t("story.storyItemEditor.updateStoryTitle")}
          </Text>
          <div className={Styles.header}>
            <p>Name</p>
            <input
              ref={(nameInput) => (this.nameInput = nameInput)}
              placeholder={t("story.storyItemEditor.placeholder")}
              autoComplete="off"
              className={Styles.field}
              type="text"
              id="name"
              value={this.state.name}
              onChange={this.updateName.bind(this)}
            />
          </div>
          <Box paddedVertically={2}>
            <button
                className={Styles.cancelBtn}
                onClick={this.cancelEditing}
                type="button"
                title={t("pin.editor.cancelBtn")}
            >
                {t("pin.editor.cancelEditing")}
            </button>
            <button
                disabled={!this.state.name.trim().length}
                className={Styles.saveBtn}
                onClick={this.save}
                type="button"
                title={t("pin.editor.saveBtn")}
            >
                {t("pin.editor.savePin")}
            </button>
          </Box>
        </div>
      </div>
    );
  }

  render() {
    return <div className={Styles.editor}>{this.renderPopupEditor()}</div>;
  }
}

StoriesItemEditor.propTypes = {
  item: PropTypes.object,
  save: PropTypes.func,
  exitEditingMode: PropTypes.func,
  isAdd: PropTypes.bool
};

StoriesItemEditor.defaultProps = { item : { name : '' }, isAdd : true };
export default withTranslation()(StoriesItemEditor);