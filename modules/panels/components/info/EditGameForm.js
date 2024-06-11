import { Button, Form, Input, Radio } from 'antd';
import { useState } from 'react';
import { useSelector } from 'react-redux';

// должна быть доступна только для ROLE_GAME_OWNER (RULE_GAME_EDIT)
const EditGameForm = () => {
  //
  const editGame = () => {};

  const game = useSelector((state) => state.game.game);

  const [name, setName] = useState(game.name);
  const [image, setImage] = useState(game.image);
  const [gameIsPublic, setGameIsPublic] = useState(game.public);
  const [description, setDescription] = useState(game.description);

  const showConfirmDialog = ({ text, okCallback }) => {
    if (confirm(text)) {
      okCallback();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name,
      gameIsPublic,
      hash: game.hash,
      description,
      image,
    };
    if (!gameIsPublic) {
      showConfirmDialog({
        text: 'You will NEVER see this game again, if you will not save its access code right now!!!',
        okCallback: () => {
          editGame(data);
        },
      });
    } else {
      editGame(data);
    }
  };

  return (
    <Form className="ant-card p-3" onFinish={(e) => handleSubmit(e)}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
    >
      <Form.Item
        name="gameIsPublic"
        valuePropName="checked"
        initialValue={gameIsPublic}
      >
        <Radio.Group>
          <Radio className="text-white" value={true}>
            Public
          </Radio>
          <Radio className="text-white" value={false}>
            Private
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="name"
        label={<span className="text-white">Name</span>}
        rules={[{ required: true, message: 'Please input name!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="image"
        label={<span className="text-white">Screenshot</span>}
        rules={[{ required: true, message: 'Please input image!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label={<span className="text-white">Description</span>}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditGameForm;
