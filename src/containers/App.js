import React, {Component} from 'react';
import {Header} from 'components';
import {connect} from 'react-redux';
import {getStatusRequest, logoutRequest} from 'actions/authentication';

class App extends Component{
    componentDidMount(){
        function getCookie(name){
            var value = "; " + document.cookie;
            var parts = value.split('; ' + name + '=');
            if(parts.length == 2) return parts.pop().split(";").shift();
        }
        
        let loginData = getCookie('key');
        console.log('1',loginData);
        if(typeof loginData === 'undefined') return;
        
        loginData = JSON.parse(atob(loginData));
        console.log('2',loginData);
        if(!loginData.isLoggedIn) return;
        console.log('3',loginData);
        this.props.getStatusRequest()
        .then(() => {
            console.log(this.props.status);
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
    
    constructor(props){
        super(props);
        
        this.handleLogout = this.handleLogout.bind(this);
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
    
    render(){
        let re = /(login|register)/;
        let isAuth = re.test(this.props.location.pathname);
        
        return (
            <div>
                {isAuth ? undefined : <Header isLoggedIn={this.props.status.isLoggedIn} onLogout={this.handleLogout}/>}
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        status: state.authentication.status
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
        logoutRequest: () => {
            return dispatch(logoutRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);