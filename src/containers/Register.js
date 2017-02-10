import React, {Component} from 'react';
import {Authentication} from 'components';
import {connect} from 'react-redux';
import {registerRequest} from 'actions/authentication';
import {browserHistory} from 'react-router';

class Register extends Component{
    constructor(props){
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
    }
    
    handleRegister(id, pw){
        return this.props.registerRequest(id, pw)
                   .then(() => {
                       if(this.props.status === "SUCCESS"){
                           Materialize.toast('Success! Please log in.', 2000);
                           browserHistory.push('/login');
                           return true;
                       }else{
                           let errorMessage = [
                                '아이디는 대, 소문자, _, - 조합 5~15자만 가능합니다.',
                                '비밀번호는 대, 소문자, 특수문자 조합 6~16자만 가능합니다.',
                                '이미 존재하는 아이디 입니다.'
                            ];
         
                            let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.errorCode - 1] + '</span>');
                            Materialize.toast($toastContent, 2000);
                            return false;
                       }
                   });
    }
    
    render(){
        return (
            <div>
                <Authentication mode={false} onRegister={this.handleRegister}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        status: state.authentication.register.status,
        errorCode: state.authentication.register.error
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        registerRequest: (id, pw) => {
            return dispatch(registerRequest(id, pw));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);