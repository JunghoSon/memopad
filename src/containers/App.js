import React, {Component} from 'react';
import {Header} from 'components';
import {connect} from 'react-redux';
import {getStatusRequest, logoutRequest} from 'actions/authentication';
import {searchRequest} from 'actions/search';

class App extends Component{
    
    constructor(props){
        super(props);
        
        this.handleLogout = this.handleLogout.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }
    
    componentDidMount(){
        function getCookie(name){
            var value = "; " + document.cookie;
            var parts = value.split('; ' + name + '=');
            if(parts.length == 2) return parts.pop().split(";").shift();
        }
        
        let loginData = getCookie('key');
        
        if(typeof loginData === 'undefined') return;
        
        loginData = JSON.parse(atob(loginData));
        
        if(!loginData.isLoggedIn) return;
        
        this.props.getStatusRequest()
        .then(() => {
            if(!this.props.status.valid){
                loginData = {
                    isLoggedIn: false,
                    username: ''
                };
                
                document.cookie = 'key=' + btoa(JSON.stringify(loginData));
                
                let $toastContent = $('<span style="color: #FFB4BA">Your session is expired, please log in again</span>');
                Materialize.toast($toastContent, 4000);
            }
        });
    }
        
    handleLogout(){
        this.props.logoutRequest()
            .then(() => {
                Materialize.toast('Good Bye!', 2000);
                
                let loginData = {
                    isLoggedIn: false,
                    username: ''
                };
                
                document.cookie = 'key=' + btoa(JSON.stringify(loginData));
            });
    }
    
    handleSearch(keyword){
        return this.props.searchRequest(keyword);
    }
    
    render(){
        let re = /(login|register)/;
        let isAuth = re.test(this.props.location.pathname);
        
        return (
            <div>
                {isAuth ? undefined : <Header isLoggedIn={this.props.status.isLoggedIn} onLogout={this.handleLogout} onSearch={this.handleSearch} usernames={this.props.searchResults}/>}
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        status: state.authentication.status,
        searchResults: state.search.usernames
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
        logoutRequest: () => {
            return dispatch(logoutRequest());
        },
        searchRequest: (keyword) => {
            return dispatch(searchRequest(keyword));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);