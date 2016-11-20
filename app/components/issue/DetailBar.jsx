import React, { PropTypes, Component } from 'react';
import { Modal, Button, ControlLabel, Label, Grid, Row, Col, Table, Tabs, Tab, Form, FormGroup, DropdownButton, MenuItem, ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import DropzoneComponent from 'react-dropzone-component';
import _ from 'lodash';

var moment = require('moment');
const img = require('../../assets/images/loading.gif');

const DelFileModal = require('./DelFileModal');

export default class DetailBar extends Component {
  constructor(props) {
    super(props);
    this.state = { tabKey: 1, delFileShow: false, selectedFile: {} };
    this.delFileModalClose = this.delFileModalClose.bind(this);
  }

  static propTypes = {
    options: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    fileLoading: PropTypes.bool.isRequired,
    delFile: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loading) {
      this.setState({ tabKey: 1 });
    }
  }

  handleTabSelect(tabKey) {
    this.setState({ tabKey });
  }

  delFileNotify(field_key, id, name) {
    const { data } = this.props;
    this.setState({ delFileShow: true, selectedFile: { field_key, id, name } });
  }

  delFileModalClose() {
    this.setState({ delFileShow: false });
  }

  render() {
    const { close, data={}, loading, options, project, fileLoading, delFile } = this.props;

    const type = _.find(options.types, { id : data.type });
    const schema = type && type.schema ? type.schema : [];

    return (
      <div className='animate-dialog'>
        <Button className='close' onClick={ close }>
          <i className='fa fa-close'></i>
        </Button>
        <div className='panel panel-default'>
          <Tabs activeKey={ this.state.tabKey } onSelect={ this.handleTabSelect.bind(this) } id='uncontrolled-tab-example'>
            <Tab eventKey={ 1 } title='基本'>
              <div className='detail-view-blanket' style={ { display: loading ? 'block' : 'none' } }><image src={ img } className='loading detail-loading'/></div>
              <Form horizontal className={ _.isEmpty(data) && 'hide' } style={ { marginRight: '10px' } }>
                <ButtonToolbar style={ { margin: '10px 10px 10px 5px' } }>
                  <Button><i className='fa fa-pencil'></i> 编辑</Button>
                  <ButtonGroup style={ { marginLeft: '10px' } }>
                  { _.map(data.wfactions || [], (v) => {
                    return ( <Button>{ v.name }</Button> ); 
                  }) }
                  </ButtonGroup>
                  <div style={ { float: 'right' } }>
                    <DropdownButton pullRight bsStyle='link' title='更多'>
                      <MenuItem eventKey='2'>刷新</MenuItem>
                    </DropdownButton>
                  </div>
                </ButtonToolbar>
                <FormGroup controlId='formControlsLabel'>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    类型 
                  </Col>
                  <Col sm={ 3 }>
                    <div style={ { marginTop: '6px' } }>{ type ? type.name : '-' }</div>
                  </Col>
                  <Col sm={ 2 } componentClass={ ControlLabel }>
                    状态 
                  </Col>
                  <Col sm={ 4 }>
                    <div style={ { marginTop: '6px' } }><Label>{ _.find(options.states, { id: data.state }) ? _.find(options.states, { id: data.state }).name : '-' }</Label></div>
                  </Col>
                </FormGroup>
                { _.map(schema, (field, key) => {
                  if (field.type !== 'File' && field.key !== 'assignee' && !data[field.key]) {
                    return;
                  }

                  let contents = '';
                  if (field.key === 'assignee') {
                    contents = data[field.key] && data[field.key].name || '-';
                  } else if (field.type === 'Select' || field.type === 'RadioGroup' || field.type === 'SingeVersion') {
                    const optionValues = field.optionValues || [];
                    contents = _.find(optionValues, { id: data[field.key] }) ? _.find(optionValues, { id: data[field.key] }).name : '-';
                  } else if (field.type === 'MultiSelect' || field.type === 'CheckboxGroup' || field.type === 'MultiVersion') {
                    const optionValues = field.optionValues || [];
                    const values = data[field.key].split(',');
                    const newValues = [];
                    _.map(values, (v, i) => {
                      if (_.find(optionValues, { id: v })) {
                        newValues.push(_.find(optionValues, { id: v }).name);
                      }
                    });
                    contents = newValues.join(',') || '-';
                  } else if (field.type === 'DatePicker'){
                    contents = moment.unix(data[field.key]).format('YYYY/MM/DD');
                  } else if (field.type === 'DateTimePicker') {
                    contents = moment.unix(data[field.key]).format('YYYY/MM/DD HH:mm');
                  } else if (field.type === 'File'){
                    const componentConfig = {
                      showFiletypeIcon: true,
                      postUrl: '/api/project/' + project.key + '/file?issue_id=' + data.id 
                    };
                    const djsConfig = {
                      addRemoveLinks: true,
                      paramName: field.key,
                      maxFilesize: 20
                    };
                    const eventHandlers = {
                      init: dz => this.dropzone = dz,
                      success: null,
                      removedfile: null 
                    }

                    const imgFiles = _.filter(data[field.key], (f) => { return _.indexOf([ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ], f.type) !== -1 });
                    const noImgFiles = _.filter(data[field.key], (f) => { return _.indexOf([ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ], f.type) === -1 });
                    contents = (<div>
                      { noImgFiles.length > 0 &&
                        <Table condensed hover responsive>
                          <tbody>
                            { _.map(noImgFiles, (f, i) => 
                              <tr key={ i }>
                                <td>{ f.name }</td>
                                <td width='2%'><span className='remove-icon' onClick={ this.delFileNotify.bind(this, field.key, f.id, f.name) }><i className='fa fa-trash'></i></span></td>
                              </tr> ) }
                          </tbody>
                        </Table> }

                      { imgFiles.length > 0 && 
                         <Grid style={ { paddingLeft: '0px' } }>
                           <Row>
                           { _.map(imgFiles, (f, i) =>
                             <Col sm={ 6 } key={ i }>
                               <div className='attachment-content'>
                                 <div className='attachment-thumb'>
                                   <img src={  '/api/project/' + project.key + '/file/' + f.id + '?flag=s' }/>
                                 </div>
                                 <div className='attachment-title-container'>
                                    <div className='attachment-title'>{ f.name }</div>
                                    <div className='remove-icon' onClick={ this.delFileNotify.bind(this, field.key, f.id, f.name) }><i className='fa fa-trash'></i></div>
                                 </div>
                               </div>
                             </Col> ) }
                           </Row>
                         </Grid> }
                      <div style={ { marginTop: '8px' } }>
                        <DropzoneComponent config={ componentConfig } eventHandlers={ eventHandlers } djsConfig={ djsConfig } />
                      </div>
                    </div>);
                  } else {
                    contents = data[field.key];
                  }
                  return (
                    <FormGroup controlId='formControlsLabel'>
                      <Col sm={ 3 } componentClass={ ControlLabel }>
                        { field.name || '-' }
                      </Col>
                      <Col sm={ 9 }>
                        <div style={ { marginTop: '6px' } }>
                          { contents }
                        </div>
                      </Col>
                    </FormGroup>
                  );
                }) }
              </Form>
            </Tab>
            <Tab eventKey={ 2 } title='备注'>
              <Form horizontal>
                <FormGroup>
                  <Col sm={ 12 }>
                    <div style={ { marginTop: '6px', marginLeft: '10px' } }>
                      <span>最新备注更新于2016/04/15 12:34:23</span>
                      <Button bsStyle='link'><i className='fa fa-refresh'></i></Button>
                    </div>
                  </Col>
                </FormGroup>
              </Form>
            </Tab>
            <Tab eventKey={ 3 } title='改动纪录'>
              <Form horizontal>
                <FormGroup>
                  <Col sm={ 12 }>
                    <div style={ { marginTop: '6px', marginLeft: '10px' } }>
                      <span>最新改动纪录更新于2016/04/15 12:34:23</span>
                      <Button bsStyle='link'><i className='fa fa-refresh'></i></Button>
                    </div>
                  </Col>
                </FormGroup>
              </Form>
            </Tab>
            <Tab eventKey={ 4 } title='工作日志'>Tab 3 content</Tab>
          </Tabs>
        </div>
        { this.state.delFileShow && <DelFileModal show close={ this.delFileModalClose } del={ delFile } data={ this.state.selectedFile } loading={ fileLoading }/> }
      </div>
    );
  }
}
