import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Divider } from 'antd';
import { User, Lock, Mail, UserPlus, LogIn, Settings, Key } from 'lucide-react';

export function LoginModal({ isOpen, onClose, onLoginSuccess, onShowSignup, onGuestLogin, onShowForgotPassword }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        message.success('Login successful');
        onLoginSuccess(data.user);
        onClose();
      } else {
        message.error(data.error || 'Login failed');
      }
    } catch (error) {
      message.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<div className="flex items-center gap-2 text-xl font-bold"><LogIn className="w-5 h-5" /> Sign In</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="max-w-md"
    >
      <Form name="login" onFinish={onFinish} layout="vertical" className="mt-6">
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }, { type: 'email' }]}
        >
          <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} placeholder="Email" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
          className="mb-1"
        >
          <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} placeholder="Password" size="large" />
        </Form.Item>
        <div className="flex justify-end mb-4">
          <a onClick={onShowForgotPassword} className="text-sm text-blue-600 hover:underline cursor-pointer">
            Forgot Password?
          </a>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading} className="bg-blue-600">
            Sign In
          </Button>
        </Form.Item>
      </Form>
      
      <Divider>OR</Divider>
      
      <div className="space-y-3">
        <Button block size="large" onClick={onGuestLogin} className="border-slate-200 hover:border-blue-500 hover:text-blue-500">
          Continue as Guest
        </Button>
        <div className="text-center text-slate-500 text-sm">
          Do not have an account? <a onClick={onShowSignup} className="text-blue-600 hover:underline cursor-pointer">Sign up now</a>
        </div>
      </div>
    </Modal>
  );
}

export function SignupModal({ isOpen, onClose, onSignupSuccess, onShowLogin }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        message.success('Account created successfully');
        onSignupSuccess(data.user);
        onClose();
      } else {
        message.error(data.error || 'Signup failed');
      }
    } catch (error) {
      message.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<div className="flex items-center gap-2 text-xl font-bold"><UserPlus className="w-5 h-5" /> Create Account</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="max-w-md"
    >
      <Form name="signup" onFinish={onFinish} layout="vertical" className="mt-6">
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input prefix={<User className="w-4 h-4 text-slate-400" />} placeholder="Full Name" size="large" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }, { type: 'email' }]}
        >
          <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} placeholder="Email" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }, { min: 8, message: 'Password must be at least 8 characters' }]}
        >
          <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} placeholder="Password" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading} className="bg-blue-600">
            Create Account
          </Button>
        </Form.Item>
      </Form>
      <div className="text-center text-slate-500 text-sm mt-4">
        Already have an account? <a onClick={onShowLogin} className="text-blue-600 hover:underline cursor-pointer">Sign in</a>
      </div>
    </Modal>
  );
}

export function ForgotPasswordModal({ isOpen, onClose, onShowLogin }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [form] = Form.useForm();

  const requestOtp = async (values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setEmail(values.email);
        setStep('verify');
      } else {
        const data = await res.json();
        message.error(data.error || 'Request failed');
      }
    } catch {
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: values.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('done');
      } else {
        message.error(data.error || 'Reset failed');
      }
    } catch {
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setEmail('');
    setOtp('');
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={<div className="flex items-center gap-2 text-xl font-bold"><Key className="w-5 h-5" /> Reset Password</div>}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      className="max-w-md"
    >
      {step === 'request' ? (
        <>
          <p className="text-slate-500 mt-4 mb-6">
            Enter your email address and we will send you a one-time code (OTP).
          </p>
          <Form name="forgot-password" onFinish={requestOtp} layout="vertical">
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }, { type: 'email' }]}
            >
              <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading} className="bg-blue-600">
                Send OTP
              </Button>
            </Form.Item>
          </Form>
        </>
      ) : step === 'verify' ? (
        <>
          <p className="text-slate-500 mt-4 mb-6">
            Enter the 6-digit code sent to <span className="font-medium">{email}</span>.
          </p>
          <Form form={form} name="verify-otp" onFinish={resetPassword} layout="vertical">
            <Form.Item label="OTP Code" required>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                size="large"
                maxLength={6}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="New Password"
              rules={[{ required: true, message: 'Please input your new password!' }, { min: 8, message: 'Password must be at least 8 characters' }]}
            >
              <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} placeholder="New password" size="large" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm New Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} placeholder="Confirm password" size="large" />
            </Form.Item>
            <Form.Item className="mb-2">
              <Button type="primary" htmlType="submit" block size="large" loading={loading} className="bg-blue-600" disabled={otp.length !== 6}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>

          <div className="flex justify-between text-sm text-slate-500 mt-4">
            <a
              onClick={() => {
                setStep('request');
                setOtp('');
                form.resetFields();
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Change email
            </a>
            <a
              onClick={() => requestOtp({ email })}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Resend OTP
            </a>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Password updated</h3>
          <p className="text-slate-500 mb-8">
            You can now sign in with your new password.
          </p>
          <Button block size="large" onClick={onShowLogin}>
            Back to Sign In
          </Button>
        </div>
      )}
      {step === 'request' && (
        <div className="text-center text-slate-500 text-sm mt-4">
          Remember your password? <a onClick={onShowLogin} className="text-blue-600 hover:underline cursor-pointer">Sign in</a>
        </div>
      )}
    </Modal>
  );
}

export function ProfileModal({ isOpen, onClose, user, onUpdateSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (isOpen && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [isOpen, user, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Only send non-empty values
      const body = {};
      if (values.name) body.name = values.name;
      if (values.email) body.email = values.email;
      if (values.password) body.password = values.password;

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        message.success('Profile updated successfully');
        onUpdateSuccess(data.user);
        onClose();
      } else {
        message.error(data.error || 'Update failed');
      }
    } catch (error) {
      message.error('An error occurred during profile update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<div className="flex items-center gap-2 text-xl font-bold"><Settings className="w-5 h-5" /> Profile Settings</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="max-w-md"
    >
      <Form form={form} name="profile" onFinish={onFinish} layout="vertical" className="mt-6">
        <Form.Item name="name" label="Full Name">
          <Input prefix={<User className="w-4 h-4 text-slate-400" />} size="large" />
        </Form.Item>
        <Form.Item 
          name="email" 
          label="Email Address"
          rules={[{ type: 'email' }]}
        >
          <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} size="large" />
        </Form.Item>
        <Form.Item 
          name="password" 
          label="New Password (leave blank to keep current)"
          rules={[{ min: 8, message: 'Password must be at least 8 characters' }]}
        >
          <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} placeholder="New password" size="large" />
        </Form.Item>
        <Form.Item className="mb-0 mt-8">
          <div className="flex gap-3">
            <Button onClick={onClose} block size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" block size="large" loading={loading} className="bg-blue-600">
              Save Changes
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
