import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Styles from "./pin-editor.scss";
import { withTranslation } from "react-i18next";
import Box from "../../Styled/Box";
import Text from "../../Styled/Text";

class PinEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      color: '#000000',
      id: '',
      inView: false
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
    const pin = this.props.pin;
    this.setState({
      name: pin.data.name,
      color: pin.metadata.color,
      id: pin.metadata.id
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
        name: '',
        color: '',
        id: ''
    });
  }

  updateName(event) {
    this.setState({
      name: event.target.value
    });
  }

  updateColor(event) {
    this.setState({
      color: event.target.value
    })
  }

  save() {
    console.log("hello " + this.state.color);
    this.props.save({
      name: this.state.name,
      color: this.state.color,
      id: this.state.id
    });
  }

  cancelEditing() {
    this.props.exitEditingMode();
    this.setState({
      name: this.props.pin.data.name,
      color: this.props.pin.metadata.color
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

  handleChange(value) {
    this.setState({ color: value });
  }

  renderPopupEditor() {
    const { t } = this.props;
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
            {t("pin.editPinTitle")}
          </Text>
          <div className={Styles.header}>
            <p>Name</p>
            <input
              ref={(nameInput) => (this.nameInput = nameInput)}
              placeholder={t("pin.editor.placeholder")}
              autoComplete="off"
              className={Styles.field}
              type="text"
              id="name"
              value={this.state.name}
              onChange={this.updateName.bind(this)}
            />
          </div>
          <div className={Styles.header}>
            <p>Color</p>
            <input
              ref={(colorInput) => (this.colorInput = colorInput)}
              className={Styles.field}
              type="color"
              id="color"
              value={this.state.color}
              onChange={this.updateColor.bind(this)}
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
                disabled={!this.state.name.length}
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

PinEditor.propTypes = {
  pin: PropTypes.object,
  save: PropTypes.func,
  exitEditingMode: PropTypes.func,
};

PinEditor.defaultProps = { pin: { data : { name : "" }, metadata : { color: "#000000", id: "" } } };
export default withTranslation()(PinEditor);