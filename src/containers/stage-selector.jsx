import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';

import {connect} from 'react-redux';
import {openBackdropLibrary} from '../reducers/modals';
import {activateTab, COSTUMES_TAB_INDEX} from '../reducers/editor-tab';

import StageSelectorComponent from '../components/stage-selector/stage-selector.jsx';

import backdropLibraryContent from '../lib/libraries/backdrops.json';
import costumeLibraryContent from '../lib/libraries/costumes.json';
import {handleFileUpload, costumeUpload} from '../lib/fileUploader';

class StageSelector extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClick',
            'handleSurpriseBackdrop',
            'handleEmptyBackdrop',
            'addBackdropFromLibraryItem',
            'handleFileUploadClick',
            'handleBackdropUpload',
            'setFileInput'
        ]);
    }
    addBackdropFromLibraryItem (item) {
        const vmBackdrop = {
            name: item.name,
            rotationCenterX: item.info[0] && item.info[0] / 2,
            rotationCenterY: item.info[1] && item.info[1] / 2,
            bitmapResolution: item.info.length > 2 ? item.info[2] : 1,
            skinId: null
        };
        return this.props.vm.addBackdrop(item.md5, vmBackdrop);
    }
    handleClick () {
        this.props.onSelect(this.props.id);
    }
    handleSurpriseBackdrop () {
        // @todo should this not add a backdrop you already have?
        const item = backdropLibraryContent[Math.floor(Math.random() * backdropLibraryContent.length)];
        this.addBackdropFromLibraryItem(item).then(() => {
            this.props.onActivateTab(COSTUMES_TAB_INDEX);
        });
    }
    handleEmptyBackdrop () {
        // @todo this is brittle, will need to be refactored for localized libraries
        const emptyItem = costumeLibraryContent.find(item => item.name === 'Empty');
        if (emptyItem) {
            this.addBackdropFromLibraryItem(emptyItem).then(() => {
                this.props.onActivateTab(COSTUMES_TAB_INDEX);
            });
        }
    }
    handleBackdropUpload (e) {
        const storage = this.props.vm.runtime.storage;
        const handleNewBackdrop = function (md5Ext, vmBackdrop) {
            this.props.vm.addBackdrop(md5Ext, vmBackdrop);
            this.props.onActivateTab(COSTUMES_TAB_INDEX);
        }.bind(this);
        const costumeOnload = costumeUpload.bind(this, storage, handleNewBackdrop);
        handleFileUpload(e.target, costumeOnload);
    }
    handleFileUploadClick () {
        this.fileInput.click();
    }
    setFileInput (input) {
        this.fileInput = input;
    }
    render () {
        const {
            /* eslint-disable no-unused-vars */
            assetId,
            id,
            onActivateTab,
            onSelect,
            /* eslint-enable no-unused-vars */
            ...componentProps
        } = this.props;
        return (
            <StageSelectorComponent
                fileInputRef={this.setFileInput}
                onBackdropFileUpload={this.handleBackdropUpload}
                onBackdropFileUploadClick={this.handleFileUploadClick}
                onClick={this.handleClick}
                onEmptyBackdropClick={this.handleEmptyBackdrop}
                onSurpriseBackdropClick={this.handleSurpriseBackdrop}

                {...componentProps}
            />
        );
    }
}
StageSelector.propTypes = {
    ...StageSelectorComponent.propTypes,
    id: PropTypes.string,
    onSelect: PropTypes.func
};

const mapStateToProps = (state, {assetId}) => ({
    url: assetId && state.vm.runtime.storage.get(assetId).encodeDataURI(),
    vm: state.vm
});

const mapDispatchToProps = dispatch => ({
    onNewBackdropClick: e => {
        e.preventDefault();
        dispatch(activateTab(COSTUMES_TAB_INDEX));
        dispatch(openBackdropLibrary());
    },
    onActivateTab: tabIndex => {
        dispatch(activateTab(tabIndex));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StageSelector);
