/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { useAuth } from '../context/UserContext';

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const Login = ({ name }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [labels, setLabels] = useState([]);
  const { login, register } = useAuth(); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const loginC = [
    { label: "Username", name: "username" },
    { label: "Password", name: "password" }
  ];

  const signinC = [
    { label: "Username", name: "username" },
    { label: "Password", name: "password" },
    { label: "Email", name: "email" },
    { label: "College", name: "college" },
  ];

  useEffect(() => {
    setLabels(name === 'Login' ? loginC : signinC);
  }, [name]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAction = async (value) => {
    setLoading(true);
    try {
      if (name === 'Login') {
        const { username, password } = value;
        await login(username, password);
      } else {
        const { username, password, email, college } = value;
        await register(username, password, email, college);
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
      onClick={showModal}
      className={`text-xl border border-none shadow-none font-serif
          ${scrolled ? "bg-main text-white" : "text-black"}`}
    >
      {name}
    </Button>

      <Modal
        title={name}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name={name}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={handleAction}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          {labels.map((item) => (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={[{ required: true, message: `Please input your ${item.label}!` }]}
            >
              {item.name === "password" ? <Input.Password /> : <Input />}
            </Form.Item>
          ))}

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Login;
