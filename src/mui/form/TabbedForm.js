import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { Tabs, Tab } from 'material-ui/Tabs';
import Toolbar from './Toolbar';
import getDefaultValues from './getDefaultValues';

export class TabbedForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
        };
    }

    handleChange = (value) => {
        this.setState({ value });
    };

    render() {
        const { children, contentContainerStyle, handleSubmit, invalid, record, resource, basePath, translate, submitOnEnter, save, toolbar, redirect } = this.props;
        return (
            <form className="tabbed-form">
                <div style={{ padding: '0 1em 1em 1em' }}>
                    <Tabs
                        value={this.state.value}
                        onChange={this.handleChange}
                        contentContainerStyle={contentContainerStyle}
                    >
                        {React.Children.map(children, (tab, index) =>
                            <Tab
                                key={tab.props.value}
                                className="form-tab"
                                label={translate(tab.props.label, { _: tab.props.label })}
                                value={index}
                                icon={tab.props.icon}
                            >
                                {React.cloneElement(tab, { resource, record, basePath })}
                            </Tab>,
                        )}
                    </Tabs>
                </div>
                {toolbar && React.cloneElement(toolbar, {
                    invalid,
                    submitOnEnter,
                    handleSubmitWithRedirect: redirectTo => handleSubmit(values => save(values, redirectTo)),
                    redirect,
                })}
            </form>
        );
    }
}

TabbedForm.propTypes = {
    toolbar: PropTypes.element,
    children: PropTypes.node,
    contentContainerStyle: PropTypes.object,
    defaultValue: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]),
    handleSubmit: PropTypes.func, // passed by redux-form
    save: PropTypes.func, // the handler defined in the parent, which triggers the REST submission
    invalid: PropTypes.bool,
    record: PropTypes.object,
    resource: PropTypes.string,
    basePath: PropTypes.string,
    translate: PropTypes.func,
    validate: PropTypes.func,
    redirect: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
    ]),
    submitOnEnter: PropTypes.bool,
};

TabbedForm.defaultProps = {
    contentContainerStyle: { borderTop: 'solid 1px #e0e0e0' },
    submitOnEnter: true,
    toolbar: <Toolbar />,
};

const enhance = compose(
    connect((state, props) => ({
        initialValues: getDefaultValues(state, props),
    })),
    reduxForm({
        form: 'record-form',
        enableReinitialize: true,
    }),
);

export default enhance(TabbedForm);
