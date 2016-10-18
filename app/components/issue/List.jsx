import React, { PropTypes, Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Button, DropdownButton, MenuItem, Label } from 'react-bootstrap';
import _ from 'lodash';

var moment = require('moment');
const DelNotify = require('./DelNotify');
const img = require('../../assets/images/loading.gif');
const PaginationList = require('./PaginationList');

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      delNotifyShow: false, 
      operateShow: false, 
      hoverRowId: ''
    };
    this.delNotifyClose = this.delNotifyClose.bind(this);
  }

  static propTypes = {
    collection: PropTypes.array.isRequired,
    selectedItem: PropTypes.object.isRequired,
    options: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    itemLoading: PropTypes.bool.isRequired,
    indexLoading: PropTypes.bool.isRequired,
    index: PropTypes.func.isRequired,
    refresh: PropTypes.func.isRequired,
    query: PropTypes.object,
    show: PropTypes.func.isRequired,
    del: PropTypes.func.isRequired,
    delNotify: PropTypes.func.isRequired
  }

  componentWillMount() {
    const { index, query={} } = this.props;
    index(query);
  }

  componentWillReceiveProps(nextProps) {
    const newQuery = nextProps.query || {};
    const { index, query } = this.props;
    if (JSON.stringify(newQuery) !== JSON.stringify(query)) {
      index(newQuery);
    }
  }

  delNotifyClose() {
    this.setState({ delNotifyShow: false });
  }

  operateSelect(eventKey) {
    const { hoverRowId } = this.state;
    const { delNotify, show } = this.props;

    if (eventKey === '2') {
      this.setState({ delNotifyShow : true });
      delNotify(hoverRowId);
    } else {
      show(hoverRowId);
      // todo err notify
      eventKey === '1' && this.setState({ editModalShow: true });
      eventKey === '3' && this.setState({ defaultValueConfigShow: true });
      eventKey === '4' && this.setState({ optionValuesConfigShow: true });
    }
  }

  onRowMouseOver(rowData) {
    this.setState({ operateShow: true, hoverRowId: rowData.id });
  }

  onMouseLeave() {
    this.setState({ operateShow: false, hoverRowId: '' });
  }

  orderBy(field) {
    const { query={}, refresh } = this.props;
    if (_.isEmpty(query) || !query.orderBy) {
      refresh(_.assign(query, { orderBy: field + ' asc', page: 1 }));
      return;
    }

    const newOrders = [];
    const orders = query.orderBy.toLowerCase().split(',');
    const ind = _.findIndex(orders, (val) => { return _.startsWith(_.trim(val), field) });
    if (ind === -1) {
      newOrders.push(field + ' asc');
    } else {
      newOrders.push(field + (_.endsWith(orders[ind], 'desc') ? ' asc' : ' desc'));
    }
    _.map(orders, (val, i) => {
      if (ind === i) {
        return;
      }
      newOrders.push(val);
    });

    refresh(_.assign(query, { orderBy: newOrders.join(','), page: 1 })); 
  }

  render() {

    const { collection, selectedItem, loading, indexLoading, itemLoading, options={}, del, query, refresh } = this.props;
    const { operateShow, hoverRowId } = this.state;

    const node = ( <span><i className='fa fa-cog'></i></span> );

    const mainOrder = {};
    if (!_.isEmpty(query) && query.orderBy) {
      let strFirstOrder = _.trim(query.orderBy.toLowerCase()).split(',').shift();
      let tmp = strFirstOrder.split(' ');
      mainOrder.field = tmp[0];
      mainOrder.order = _.trim(tmp[1] || 'asc');
    }

    const issues = [];
    const issueNum = collection.length;
    for (let i = 0; i < issueNum; i++) {

      const priorityInd = options.config ? _.findIndex(options.config.priorities, { id: collection[i].priority }) : -1;
      const priorityStyle = { backgroundColor: priorityInd !== -1 ? options.config.priorities[priorityInd].color : '#cccccc', marginLeft: '14px' };

      issues.push({
        id: collection[i].id,
        type: (
          <span className='type-abb' title={ options.config && _.findIndex(options.config.types, { id: collection[i].type }) !== -1 ? _.find(options.config.types, { id: collection[i].type }).name : '' }>
            { options.config && _.findIndex(options.config.types, { id: collection[i].type }) !== -1 ? _.find(options.config.types, { id: collection[i].type }).abb : '-' }
          </span>),
        name: (
          <div>
            <span className='table-td-issue-title'>
              { collection[i].title ? (collection[i].no + ' - ' + collection[i].title) : '-' }
            </span>
            { collection[i].reporter && <span className='table-td-issue-desc'>{ collection[i].reporter.name + '  |  ' + moment.unix(collection[i].created_at).format('YYYY/MM/DD HH:mm') }</span> }
            
          </div>
        ), 
        assignee: !_.isEmpty(collection[i].assignee) ? collection[i].assignee.name : '-',
        priority: (<div className='circle' style={ priorityStyle } title={ priorityInd !== -1 ? options.config.priorities[priorityInd].name : '' }/>),
        state: options.config && _.findIndex(options.config.states, { id: collection[i].state }) !== -1 ? _.find(options.config.states, { id: collection[i].state }).name : '-', 
        resolution: options.config && _.findIndex(options.config.resolutions, { id: collection[i].resolution }) !== -1 ? _.find(options.config.resolutions, { id: collection[i].resolution }).name : '-', 
        operation: (
          <div>
            { operateShow && hoverRowId === collection[i].id && !itemLoading &&
              <DropdownButton pullRight bsStyle='link' style={ { textDecoration: 'blink' ,color: '#000' } } title={ node } key={ i } id={ `dropdown-basic-${i}` } onSelect={ this.operateSelect.bind(this) }>
                <MenuItem eventKey='2'>删除</MenuItem>
              </DropdownButton>
            }
            <image src={ img } className={ itemLoading && selectedItem.id === collection[i].id ? 'loading' : 'hide' }/>
          </div>
        )
      });
    }

    const opts = {};
    if (indexLoading) {
      opts.noDataText = ( <div><image src={ img } className='loading'/></div> );
    } else {
      opts.noDataText = '暂无数据显示。'; 
    } 

    opts.onRowMouseOver = this.onRowMouseOver.bind(this);
    opts.onMouseLeave = this.onMouseLeave.bind(this);

    return (
      <div>
        <BootstrapTable data={ issues } bordered={ false } hover options={ opts } trClassName='tr-top'>
          <TableHeaderColumn dataField='id' hidden isKey>ID</TableHeaderColumn>
          <TableHeaderColumn width='50' dataField='type'><span className='table-header' onClick={ this.orderBy.bind(this, 'type') }>类型{ mainOrder.field === 'type' && (mainOrder.order === 'desc' ? <i className='fa fa-arrow-down'></i> : <i className='fa fa-arrow-up'></i>) }</span></TableHeaderColumn>
          <TableHeaderColumn dataField='name'><span className='table-header' onClick={ this.orderBy.bind(this, 'title') }>主题 { mainOrder.field === 'title' && (mainOrder.order === 'desc' ? <i className='fa fa-arrow-down'></i> : <i className='fa fa-arrow-up'></i>) }</span></TableHeaderColumn>
          <TableHeaderColumn width='120' dataField='assignee'><span className='table-header' onClick={ this.orderBy.bind(this, 'assignee') }>经办人 { mainOrder.field === 'assignee' && (mainOrder.order === 'desc' ? <i className='fa fa-arrow-down'></i> : <i className='fa fa-arrow-up'></i>) }</span></TableHeaderColumn>
          <TableHeaderColumn width='70' dataField='priority'><span className='table-header' onClick={ this.orderBy.bind(this, 'priority') }>优先级 { mainOrder.field === 'priority' && (mainOrder.order === 'desc' ? <i className='fa fa-arrow-down'></i> : <i className='fa fa-arrow-up'></i>) }</span></TableHeaderColumn>
          <TableHeaderColumn width='100' dataField='state'><span className='table-header' onClick={ this.orderBy.bind(this, 'state') }>状态{ mainOrder.field === 'state' && (mainOrder.order === 'desc' ? <i className='fa fa-arrow-down'></i> : <i className='fa fa-arrow-up'></i>) }</span></TableHeaderColumn>
          <TableHeaderColumn width='100' dataField='resolution'><span className='table-header' onClick={ this.orderBy.bind(this, 'resolution') }>解决结果{ mainOrder.field === 'resolution' && (mainOrder.order === 'desc' ? <i className='fa fa-arrow-down'></i> : <i className='fa fa-arrow-up'></i>) }</span></TableHeaderColumn>
          <TableHeaderColumn width='60' dataField='operation'/>
        </BootstrapTable>
        { options.total && options.total > 0 ? <PaginationList total={ options.total || 0 } curPage={ query.page || 1 } sizePerPage={ options.sizePerPage || 5 } paginationSize={ 5 } query={ query } refresh={ refresh }/> : '' }
        { this.state.delNotifyShow && <DelNotify show close={ this.delNotifyClose } data={ selectedItem } del={ del }/> }
      </div>
    );
  }
}