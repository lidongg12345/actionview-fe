import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { Label } from 'react-bootstrap';
const $ = require('$');

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      projectPanelShow: false,
      projectBrowseShow: false, 
      schemeConfigShow: false, 
      projectConfigShow: false, 
      adminPanelShow: false,
      adminSchemeShow: false, 
      adminSysManageShow: false, 
      adminSysSettingShow: false, 
      tackFlag: true };
  }

  static propTypes = {
    project: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    pathname: PropTypes.string
  }

  componentDidMount() {
    $('.toc-container').click(function(e) {
      if (e.target.nodeName !== 'I' && e.target.nodeName !== 'A' && e.target.nodeName !== 'SPAN') {
        e.stopPropagation();
      }
    });

    $(document).click(function() {
      if ($('.toc-container').eq(0).css('position') === 'fixed') {
        $('.toc-container').animate({ left: '-250px' });
      }
    });
  }

  hideBar() {
    //box-shadow: 0 0 .5rem #9da5ab;
    $('.toc-container').animate({ left: '-250px' });
    $('.toc-container').css({ position: 'fixed' });
    $('.head').css({ paddingLeft: '15px' });
    $('#show-bar').show();
  }

  tackBar() {
    $('.head').css({ paddingLeft: '265px' });
    $('.toc-container').css({ position: 'relative', boxShadow: 'none', borderRight: 'solid 1px #e5e5e5' });
    $('#show-bar').hide();
    $('#tack-bar').hide();
    $('#hide-bar').show();
  }

  componentWillReceiveProps(nextProps) {
    const browseModules = [ 'summary', 'issue', 'activity' ];
    const schemeModules = [ 'type', 'workflow', 'field', 'screen', 'resolution', 'priority', 'state', 'role', 'events' ];
    const configModules = [ 'module', 'version', 'team' ];
    if (nextProps.pathname) {
      const sections = nextProps.pathname.split('/');
      if (sections.length > 1) {
        sections.shift();
      }
      if (sections.length <= 0) {
        return;
      }

      let appType = sections.shift(); 
      if (appType === 'admin') {
        this.state.adminPanelShow = true;
        this.state.projectPanelShow = false;
      } else {
        this.state.adminPanelShow = false;
        this.state.projectPanelShow = true;
      }

      if (this.state.projectPanelShow) {
        let modulename = sections.pop();
        if (browseModules.indexOf(modulename) !== -1) {
          this.state.projectBrowseShow = true;
        } else if (configModules.indexOf(modulename) !== -1) {
          this.state.projectConfigShow = true;
        } else if (schemeModules.indexOf(modulename) !== -1) {
          this.state.schemeConfigShow = true;
        } else {
          if (sections.length > 1) {
            modulename = sections.pop();
            if (modulename === 'workflow') {
              this.state.schemeConfigShow = true;
            }
          }else {
            this.state.projectBrowseShow = true;
          }
        }
      }

      if (this.state.adminPanelShow) {
        let modulename = sections.shift();
        if (modulename === 'scheme') {
          this.state.adminSchemeShow = true;
        } else if (modulename === 'project' || modulename === 'user') {
          this.state.adminSysManageShow = true;
        } else if (modulename === 'syssetting') {
          this.state.adminSysSettingShow = true;
        }
      }
    }
  }

  render() {
    const { project, session } = this.props;

    if (this.state.adminPanelShow) {
      return (
      <div className='toc-container'>
        <div className='react-menu-container'>
          <div style={ { height: '50px', lineHeight: '35px', paddingTop: '8px' } }>
            <span className='span-bar-icon' onClick={ this.hideBar.bind(this) }><i className='fa fa-bars'></i></span>
            <span className='span-angle-double' id='hide-bar' onClick={ this.hideBar.bind(this)  }><i className='fa fa-angle-double-left'></i></span>
            <span className='span-tack-bar' style={ { display: 'none' } } id='tack-bar' onClick={ this.tackBar.bind(this) }><i className='fa fa-thumb-tack'></i></span>
          </div>
          <div>
            <h4 style={ { overflow: 'hidden', textOverflow: 'ellipsis' } }>管理员管理面板</h4>
            <h4><i className={ this.state.adminSchemeShow ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o' } onClick={ (e) => { this.setState({ adminSchemeShow: !this.state.adminSchemeShow }); e.nativeEvent.stopImmediatePropagation(); } }></i>问题方案配置</h4>
            <ul className={ !this.state.adminSchemeShow && 'hide' }>
              <li><Link to='/admin/scheme/type'>问题类型</Link></li>
              <li><Link to='/admin/scheme/workflow'>工作流</Link></li>
              <li><Link to='/admin/scheme/field'>字段</Link></li>
              <li><Link to='/admin/scheme/state'>界面</Link></li>
              <li><Link to='/admin/scheme/state'>状态</Link></li>
              <li><Link to='/admin/scheme/resolution'>解决结果</Link></li>
              <li><Link to='/admin/scheme/priority'>优先级</Link></li>
              <li><Link to='/admin/scheme/role'>角色权限</Link></li>
              <li><Link to='/admin/scheme/events'>通知事件</Link></li>
            </ul>
            <h4><i className={ this.state.adminSysManageShow ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o' } onClick={ (e) => { this.setState({ adminSysManageShow: !this.state.adminSysManageShow }); e.nativeEvent.stopImmediatePropagation(); } }></i>系统管理</h4>
            <ul className={ !this.state.adminSysManageShow && 'hide' }>
              <li><Link to='/admin/user'>用户管理</Link></li>
              <li><Link to='/admin/project'>项目管理</Link></li>
            </ul>
            <h4><i className={ this.state.adminSysSettingShow ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o' } onClick={ (e) => { this.setState({ adminSysSettingShow: !this.state.adminSysSettingShow }); e.nativeEvent.stopImmediatePropagation(); } }></i>系统配置</h4>
            <ul className={ !this.state.adminSysSettingShow && 'hide' }>
              <li><Link to='/admin/syssetting'>配置</Link></li>
            </ul>
          </div>
        </div>
      </div>);
    } else {
      return (
      <div className='toc-container'>
        <div className='react-menu-container'>
          <div style={ { height: '50px', lineHeight: '35px', paddingTop: '8px' } }>
            <span className='span-bar-icon' onClick={ this.hideBar.bind(this) }><i className='fa fa-bars'></i></span>
            <span className='span-angle-double' id='hide-bar' onClick={ this.hideBar.bind(this)  }><i className='fa fa-angle-double-left'></i></span>
            <span className='span-tack-bar' style={ { display: 'none' } } id='tack-bar' onClick={ this.tackBar.bind(this) }><i className='fa fa-thumb-tack'></i></span>
          </div>
          { project.item.key ? 
          <div>
            <h4 style={ { overflow: 'hidden', textOverflow: 'ellipsis' } }>{ project.item.name || '' }</h4>
            <h4><i className={ this.state.projectBrowseShow ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o' } onClick={ (e) => { this.setState({ projectBrowseShow: !this.state.projectBrowseShow }); e.nativeEvent.stopImmediatePropagation(); } }></i>项目概述</h4>
            <ul className={ !this.state.projectBrowseShow && 'hide' }>
              <li><Link to={ '/project/' + project.item.key + '/summary' }>概要</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/issue' }>问题</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/activity' }>活动</Link></li>
            </ul>
            <h4><i className={ this.state.projectConfigShow ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o' } onClick={ (e) => { this.setState({ projectConfigShow: !this.state.projectConfigShow }); e.nativeEvent.stopImmediatePropagation(); } }></i>项目管理</h4>
            <ul className={ !this.state.projectConfigShow && 'hide' }>
              <li><Link to={ '/project/' + project.item.key + '/module' }>模块</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/version' }>版本</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/team' }>成员</Link></li>
            </ul>
            <h4><i className={ this.state.schemeConfigShow ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o' } onClick={ (e) => { this.setState({ schemeConfigShow: !this.state.schemeConfigShow }); e.nativeEvent.stopImmediatePropagation(); } }></i>问题方案配置</h4>
            <ul className={ !this.state.schemeConfigShow && 'hide' }>
              <li><Link to={ '/project/' + project.item.key + '/type' }>问题类型</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/workflow' }>工作流</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/field' }>字段</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/screen' }>界面</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/state' }>状态</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/resolution' }>解决结果</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/priority' }>优先级</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/role' }>角色权限</Link></li>
              <li><Link to={ '/project/' + project.item.key + '/events' }>通知事件</Link></li>
            </ul>
            <h4>&nbsp;</h4><h4>&nbsp;</h4>
          </div>
          :
          <h4 style={ { overflow: 'hidden', textOverflow: 'ellipsis' } }>请选择要查看的项目</h4> } 
        </div>
      </div>);
    }
  }
}
