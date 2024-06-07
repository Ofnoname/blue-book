// LoginPage.tsx
import React, {useEffect, useState} from 'react';
import { Form, Input, Button, message } from 'antd';
import {UserOutlined, LockOutlined, LoginOutlined} from '@ant-design/icons';
import { login } from './api/api.ts';
import './Login.css'

import {useNavigate} from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const response = await login(values.username, values.password);
            if (response.auth) {
                localStorage.setItem('jwtoken', response.token);
                // localStorage.setItem('username', response.username);
                localStorage.setItem('role', response.role);
                localStorage.setItem('avatar_url', response.avatar_url);

                message.success("登录成功");
                await new Promise(resolve => setTimeout(resolve, 1000));

                // react router 跳转
                navigate('/dashboard');
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('登录失败，请稍后重试！');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = '登录 - 小蓝书管理平台';
        const jwt = localStorage.getItem('jwtoken');
        if (jwt) {
            navigate('/dashboard');
        }
    }, []);

    return (
        <main className="login-container">
            <div className="login-banner">
            </div>
            <div className="login-content">
                <img src="./icon.jpg" alt="logo" className="login-logo" />
                <h1 className="login-title">欢迎登陆小蓝书管理平台</h1>
                <Form
                    name="login_form"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入您的用户名!' }]}
                    >
                        <Input size={"large"} prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入您的密码!' }]}
                    >
                        <Input
                            size={"large"}
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="密码"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" size={"large"} htmlType="submit" icon={<LoginOutlined />} className="login-form-button" loading={loading}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </main>
    );
};

export default LoginPage;
