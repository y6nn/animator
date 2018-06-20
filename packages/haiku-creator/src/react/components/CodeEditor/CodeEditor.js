/**
 * @file Work based on https://github.com/superRaytin/react-monaco-editor/blob/master/src/editor.js
 */

import * as React from 'react';
import * as Radium from 'radium';
import MonacoEditor from './MonacoEditor';
import SaveContentsPopup from './SaveContentsPopup';
import BytecodeErrorPopup from './BytecodeErrorPopup';

class CodeEditor extends React.Component {
  constructor (props) {
    super(props);

    this.onMonacoEditorChange = this.onMonacoEditorChange.bind(this);
    this.saveCodeFromEditorToDisk = this.saveCodeFromEditorToDisk.bind(this);
    this.onProjectModelUpdate = this.onProjectModelUpdate.bind(this);

    this.hideBytecodeErrorPopup = () => {
      this.setState({
        showBytecodeErrorPopup: false,
      });
    };

    this.state = {
      currentComponentCode: '',
      currentEditorContents: '',
      currentBytecodeError: null,
      showBytecodeErrorPopup: false,
    };
  }

  onProjectModelUpdate (what) {
    switch (what) {
      case 'reloaded':
        const ac = this.props.projectModel.getCurrentActiveComponent();
        if (!ac) {
          break;
        }

        const newComponentCode = ac.fetchActiveBytecodeFile().getCode();

        this.setState({currentComponentCode: newComponentCode}, () => {
          this.onMonacoEditorChange(newComponentCode);
        });
        break;
    }
  }

  componentDidMount () {
    if (this.props.projectModel) {
      // Reload monaco contents on component load (eg. changing active component, loading a new project, ..)
      this.props.projectModel.on('update', this.onProjectModelUpdate);
    }
  }

  componentWillUnmount () {
    if (this.props.projectModel) {
      this.props.projectModel.removeListener('update', this.onProjectModelUpdate);
    }
  }

  /**
   * Keep monaco component synced with states from CodeEditor (currentEditorContents) and
   * Stage (nonSavedContentOnCodeEditor).
   */
  onMonacoEditorChange (newContent) {
    this.setState({currentEditorContents: newContent}, () => {
      this.props.setNonSavedContentOnCodeEditor(this.state.currentComponentCode !== this.state.currentEditorContents);
    });
  }

  saveCodeFromEditorToDisk () {
    const activeComponent = this.props.projectModel.getCurrentActiveComponent();
    if (!activeComponent) {
      return;
    }

    activeComponent.replaceBytecode(this.state.currentEditorContents, {from: 'creator'}, (error) => {
      this.setState({
        currentBytecodeError: error,
        showBytecodeErrorPopup: !!error,
      });

      if (!error) {
        this.setState({currentComponentCode: this.state.currentEditorContents}, () => {
          this.onMonacoEditorChange(this.state.currentEditorContents);
        });
      }
    });
  }

  render () {
    const monacoOptions = {
      language: 'javascript',
      lineNumbers: 'on',
      links: false,
      theme: 'haiku',
      minimap: {enabled: false},
      autoIndent: true,
      contextmenu: false,
      codeLens: false,
      parameterHints: false,
      cursorBlinking: 'blink',
      scrollBeyondLastLine: false,
    };

    return (
      <div style={{width: '100%', height: '100%'}}>
        {this.props.showPopupToSaveRawEditorContents &&
          <SaveContentsPopup
            projectModel={this.props.projectModel}
            targetComponentToChange={this.props.targetComponentToChange}
            setShowPopupToSaveRawEditorContents={this.props.setShowPopupToSaveRawEditorContents}
            saveCodeFromEditorToDisk={this.saveCodeFromEditorToDisk}
          />}
        {this.state.showBytecodeErrorPopup &&
          <BytecodeErrorPopup
            currentBytecodeError={this.state.currentBytecodeError}
            closeBytecodeErrorPopup={this.hideBytecodeErrorPopup}
          />}
        <MonacoEditor
          language="javascript"
          value={this.state.currentEditorContents}
          options={monacoOptions}
          style={{
            width: '100%',
            height: '100%',
          }}
          onChange={this.onMonacoEditorChange}
        />
      </div>
    );
  }
}

export default Radium(CodeEditor);